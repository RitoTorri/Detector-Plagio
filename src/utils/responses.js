const QuerySuccess = (res, data) => {
    return res.status(200).json({
        success: true,
        message: "Consulta realizada correctamente",
        details: "La consulta fue realizada correctamente. El resultado es el siguiente:",
        data: data
    });
}

const QueryError = (res, error) => {
    return res.status(500).json({
        success: false,
        message: "Error en la consulta",
        details: "La consulta no pudo realizarse. El error es el siguiente:",
        error: error
    });
}

export default { QuerySuccess, QueryError };