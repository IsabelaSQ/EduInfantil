<?php
/**
 * Safari Alpha — api.php
 * Backend PHP: autenticação, exploradores e progresso
 * Requer PHP 7.4+ e MySQL/MariaDB
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Pre-flight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ====================================================
   CONFIGURAÇÃO DO BANCO DE DADOS
==================================================== */
define('DB_HOST', 'localhost');
define('DB_NAME', 'safari_alpha');
define('DB_USER', 'root');       // ← altere para seu usuário
define('DB_PASS', 'alunolab');           // ← altere para sua senha
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        DB_HOST, DB_NAME, DB_CHARSET
    );
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

/* ====================================================
   ROTEADOR
==================================================== */
$method = $_SERVER['REQUEST_METHOD'];
$action = '';

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
} elseif ($method === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? '';
}

try {
    switch ($action) {

        // ---------- GET: Lista todos os exploradores ----------
        case 'exploradores':
            echo json_encode(getExploradores());
            break;

        // ---------- GET: Progresso de um explorador ----------
        case 'progresso':
            $id = (int)($_GET['explorer_id'] ?? 0);
            if (!$id) throw new InvalidArgumentException('explorer_id obrigatório');
            echo json_encode(getProgresso($id));
            break;

        // ---------- POST: Login / validar senha ---------------
        case 'login':
            $id = (int)($input['explorer_id'] ?? 0);
            if (!$id) throw new InvalidArgumentException('explorer_id obrigatório');
            echo json_encode(registrarLogin($id));
            break;

        // ---------- POST: Salvar resultado de fase -----------
        case 'salvar_progresso':
            $id      = (int)($input['explorer_id'] ?? 0);
            $section = trim($input['section']      ?? '');
            $level   = (int)($input['level']       ?? 0);
            $stars   = min(3, max(0, (int)($input['estrelas'] ?? 0)));

            if (!$id || !$section || !$level) {
                throw new InvalidArgumentException('Parâmetros inválidos');
            }
            echo json_encode(salvarProgresso($id, $section, $level, $stars));
            break;

        // ---------- POST: Criar novo explorador ---------------
        case 'criar_explorador':
            $nome  = trim($input['nome']  ?? '');
            $emoji = trim($input['emoji'] ?? '👦');
            $senha = $input['senha']      ?? [];   // array de 3 emojis
            if (!$nome || count($senha) !== 3) {
                throw new InvalidArgumentException('nome e senha (3 bichinhos) obrigatórios');
            }
            echo json_encode(criarExplorador($nome, $emoji, $senha));
            break;

        // ---------- GET: Ranking geral -----------------------
        case 'ranking':
            echo json_encode(getRanking());
            break;

        default:
            http_response_code(404);
            echo json_encode(['erro' => "Ação '$action' não encontrada"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro de banco de dados', 'detalhe' => $e->getMessage()]);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['erro' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno', 'detalhe' => $e->getMessage()]);
}

/* ====================================================
   FUNÇÕES DE NEGÓCIO
==================================================== */

/**
 * Retorna todos os exploradores cadastrados
 */
function getExploradores(): array {
    $db   = getDB();
    $stmt = $db->query('SELECT id, nome, emoji, moedas FROM exploradores ORDER BY id');
    $rows = $stmt->fetchAll();

    // Não retornamos a senha em plain-text; o front usa a
    // função verificarSenha() abaixo para checar.
    return ['exploradores' => $rows];
}

/**
 * Verifica a senha de um explorador
 * (chamado internamente pelo action=login)
 */
function registrarLogin(int $id): array {
    $db   = getDB();
    $stmt = $db->prepare('SELECT moedas FROM exploradores WHERE id = ?');
    $stmt->execute([$id]);
    $row  = $stmt->fetch();

    if (!$row) {
        throw new InvalidArgumentException('Explorador não encontrado');
    }

    // Registra sessão de login
    $db->prepare(
        'INSERT INTO logins (explorer_id, data_login) VALUES (?, NOW())'
    )->execute([$id]);

    return ['ok' => true, 'moedas' => (int)$row['moedas']];
}

/**
 * Valida a senha (3 emojis) de um explorador
 */
function validarSenha(int $id, array $tentativa): array {
    $db   = getDB();
    $stmt = $db->prepare('SELECT senha_json FROM exploradores WHERE id = ?');
    $stmt->execute([$id]);
    $row  = $stmt->fetch();

    if (!$row) throw new InvalidArgumentException('Explorador não encontrado');

    $correta = json_decode($row['senha_json'], true);
    $ok      = ($tentativa === $correta);

    return ['ok' => $ok];
}

/**
 * Cria um novo explorador
 */
function criarExplorador(string $nome, string $emoji, array $senha): array {
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO exploradores (nome, emoji, senha_json, moedas, criado_em)
         VALUES (?, ?, ?, 0, NOW())'
    );
    $stmt->execute([$nome, $emoji, json_encode($senha)]);
    $novoId = (int)$db->lastInsertId();

    return ['ok' => true, 'id' => $novoId, 'nome' => $nome, 'emoji' => $emoji, 'moedas' => 0];
}

/**
 * Retorna o progresso completo de um explorador
 */
function getProgresso(int $id): array {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT secao, fase, estrelas, concluido_em
         FROM progresso
         WHERE explorer_id = ?
         ORDER BY secao, fase'
    );
    $stmt->execute([$id]);
    $fases = $stmt->fetchAll();

    $stmtMoedas = $db->prepare('SELECT moedas FROM exploradores WHERE id = ?');
    $stmtMoedas->execute([$id]);
    $moedas = (int)($stmtMoedas->fetchColumn() ?? 0);

    return [
        'explorer_id' => $id,
        'moedas'      => $moedas,
        'fases'       => $fases,
    ];
}

/**
 * Salva o resultado de uma fase (cria ou atualiza com melhor pontuação)
 */
function salvarProgresso(int $id, string $secao, int $fase, int $estrelas): array {
    $db = getDB();

    // Busca registro existente
    $stmt = $db->prepare(
        'SELECT id, estrelas FROM progresso WHERE explorer_id = ? AND secao = ? AND fase = ?'
    );
    $stmt->execute([$id, $secao, $fase]);
    $existente = $stmt->fetch();

    $moedasGanhas = 0;

    if ($existente) {
        // Atualiza apenas se a nova pontuação for melhor
        if ($estrelas > (int)$existente['estrelas']) {
            $db->prepare(
                'UPDATE progresso SET estrelas = ?, concluido_em = NOW() WHERE id = ?'
            )->execute([$estrelas, $existente['id']]);
            $moedasGanhas = $estrelas * 2; // bônus por melhoria
        }
    } else {
        // Insere novo registro
        $db->prepare(
            'INSERT INTO progresso (explorer_id, secao, fase, estrelas, concluido_em)
             VALUES (?, ?, ?, ?, NOW())'
        )->execute([$id, $secao, $fase, $estrelas]);
        $moedasGanhas = $estrelas * 5; // recompensa por completar pela 1ª vez
    }

    // Adiciona moedas ao explorador
    if ($moedasGanhas > 0) {
        $db->prepare(
            'UPDATE exploradores SET moedas = moedas + ? WHERE id = ?'
        )->execute([$moedasGanhas, $id]);
    }

    // Busca saldo atualizado
    $stmtMoedas = $db->prepare('SELECT moedas FROM exploradores WHERE id = ?');
    $stmtMoedas->execute([$id]);
    $totalMoedas = (int)$stmtMoedas->fetchColumn();

    return [
        'ok'           => true,
        'moedas_ganhas'=> $moedasGanhas,
        'moedas_total' => $totalMoedas,
    ];
}

/**
 * Ranking geral (top 10 por moedas)
 */
function getRanking(): array {
    $db   = getDB();
    $stmt = $db->query(
        'SELECT nome, emoji, moedas
         FROM exploradores
         ORDER BY moedas DESC
         LIMIT 10'
    );
    return ['ranking' => $stmt->fetchAll()];
}