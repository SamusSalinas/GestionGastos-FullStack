// Como definir un componente 
// Pasar 'props como argumento a la funcion 
function Tarjeta({nombre, oficio, color, onDelete}) {
    return(
        <div className="tarjeta" style={{ borderLeft: `6px solid ${color}`}}>
            <div className="info-gasto">
                {/*Usamos las llaves {} para mostrar el contenido de las props */}
                <h3>{nombre}</h3>
                <p>{oficio}</p>
            </div>
            {/* Botón de eliminar */}
            <button className="boton-eliminar" onClick={onDelete} title="Eliminar">
                🗑️
            </button>
        </div>
    );
}

//Asi se exporta para que lo puedan usar otros archivos
export default Tarjeta;