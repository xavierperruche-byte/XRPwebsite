<?php

const VALORIS_BASE_URL = "https://valoris-immo.fr/api/v1/prix-median";

/**
 * Appel brut à l’API /prix-median
 */
function valoris_prix_median(array $params) {
    $url = VALORIS_BASE_URL . "?" . http_build_query($params);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => ["Accept: application/json"]
    ]);

    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        return [
            "error"   => true,
            "message" => "Erreur CURL : " . $error,
            "status"  => $status
        ];
    }

    if ($status !== 200) {
        // On renvoie le détail de l’erreur de l’API si possible
        $json = json_decode($response, true);
        $detail = $json["detail"] ?? $json["error"] ?? "Réponse API invalide (HTTP $status)";
        return [
            "error"   => true,
            "message" => $detail,
            "status"  => $status
        ];
    }

    $json = json_decode($response, true);
    if ($json === null) {
        return [
            "error"   => true,
            "message" => "JSON invalide renvoyé par l’API.",
            "status"  => $status
        ];
    }

    return $json;
}

/**
 * Normalisation pour robot003
 */
function valoris_normalize_market(array $raw) {
    return [
        "success"          => $raw["success"] ?? false,
        "statut"           => $raw["statut"] ?? null,
        "dept"             => $raw["code_departement"] ?? null,
        "type_bien"        => $raw["type_bien"] ?? null,
        "annee"            => $raw["annee"] ?? null,
        "prix_median_m2"   => $raw["prix_median_m2"] ?? null,
        "nb_transactions"  => $raw["nb_transactions"] ?? null,
        "evolution_1an_pct"=> $raw["evolution_1an_pct"] ?? null,
        "code_commune"     => $raw["code_commune"] ?? null,
        "nom_commune"      => $raw["nom_commune"] ?? null,
        "timestamp"        => date("Y-m-d H:i:s")
    ];
}

function safe($value, $default = "N/A") {
    return isset($value) && $value !== "" ? $value : $default;
}