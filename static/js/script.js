const imageContainer  = document.getElementsByClassName('imageContainer')[0]
let isDrawing = false;
let isDragging = false;
let isMoving = false;
let startX, startY, currentBox;
let scale = 1;
let imagen_actual;
let current_chosen_class_div;

//cargar imagen sin etiquetar
async function cargar_imagen_nueva() {
    const apiUrl = `/get_image`;

    try {
        // Hacer la solicitud GET
        const response = await fetch(apiUrl);

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Asegurarse de que los datos tengan el formato esperado
        if (!Array.isArray(data) || data.length < 2) {
            throw new Error("Formato de datos inesperado");
        }

        // Asignar los datos
        const imagen_actual = data[0];
        const imageBase64 = data[1];

        // Decodificar la imagen base64 y asignarla al src del <img>
        document.getElementsByClassName('image')[0].src = `data:image/jpeg;base64,${imageBase64}`;
    } catch (error) {
        console.error('Error:', error);
        alert("No hay más imágenes o ocurrió un error al cargar la imagen.");
    }
}

cargar_imagen_nueva()



//crear menu de opciones de caja
index = 0
for (const element of opciones) {
    let opcion = document.createElement("div")
    opcion.innerText = element
    opcion.value = element
    opcion.onclick = ()=>{current_chosen_class_div = opcion}
    opcion.color = generarColorAleatorioRGB()
    opcion.style.borderColor = "rgb("+opcion.color+")"
    opcion.style.background = "rgba("+opcion.color+",0.2)"
    opcion.idImage = index
    index++

    document.getElementById("sidebar").append(opcion)
}



// Dibujar una nueva caja
imageContainer.addEventListener('mousedown', (event) => {
    if (event.button !== 0) { // si no es el click izquiero, ignorar
        return;
    }
    if (event.target === imageContainer) {
        [...document.getElementsByClassName("box")].forEach(element => {
            element.classList.add("is_active")
        });
        isDrawing = true;
        startX = event.offsetX;
        startY = event.offsetY;

        // Crear una nueva caja
        currentBox = document.createElement('div');
        currentBox.className = 'box';
        currentBox.classList.add("is_active")
        currentBox.style.left = `${startX}px`;
        currentBox.style.top = `${startY}px`;
        currentBox.style.background = "rgba(" + current_chosen_class_div.color + ",0.2)"
        currentBox.style.borderColor = "rgb(" + current_chosen_class_div.color + ")"

        currentBox.idImage = current_chosen_class_div.idImage


        btn_eliminar = document.createElement("div")
        let box = currentBox
        btn_eliminar.onclick =()=> {box.remove()}
        btn_eliminar.innerText = "X"
        currentBox.append(btn_eliminar)

        imageContainer.appendChild(currentBox);
    }
});

imageContainer.addEventListener('mousemove', (event) => {
    if (isDrawing && currentBox) {
        const currentX = event.offsetX;
        const currentY = event.offsetY;

        // Calcular las dimensiones de la caja
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);


        // Ajustar las posiciones para soportar arrastre hacia atrás
        currentBox.style.left = `${Math.min(currentX, startX)}px`;
        currentBox.style.top = `${Math.min(currentY, startY)}px`;

        currentBox.style.width = `${width}px`;
        currentBox.style.height = `${height}px`;
    }
});

imageContainer.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        currentBox.classList.remove("is_active");
        [...document.getElementsByClassName("box")].forEach(element => {
            element.classList.remove("is_active")
        });
        currentBox = null;
    }
});




// Permitir mover cajas existentes
imageContainer.addEventListener('mousedown', (event) => {
    if (event.button !== 0) { // si no es el click izquiero, ignorar
        return;
    }
    if (event.target.classList.contains('box')) {
        isMoving = true;
        currentBox = event.target;
        currentBox.classList.add("is_active");
        [...document.getElementsByClassName("box")].forEach(element => {
            element.classList.add("is_active")
        });
        startX = event.offsetX ;
        startY = event.offsetY;

        // Cambiar el cursor para mover
        currentBox.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', (event) => {
    if (isMoving && currentBox) {
        const newLeft = event.offsetX - startX;
        const newTop = event.offsetY - startY;

        currentBox.style.left = `${newLeft}px`;
        currentBox.style.top = `${newTop}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isMoving) {
        isMoving = false;
        if (currentBox) currentBox.style.cursor = 'move';
        currentBox.classList.remove("is_active");
        [...document.getElementsByClassName("box")].forEach(element => {
            element.classList.remove("is_active")
        });
        currentBox = null;

    }
});







// Manejo del arrastre
document.addEventListener('mousedown', (event) => {
  if (event.button === 1) { // Botón central (rueda del ratón)
    isDragging = true;
    document.body.style.cursor = 'grabbing';
    startX = event.clientX;
    startY = event.clientY;
    initialLeft = parseInt(window.getComputedStyle(imageContainer).left, 10);
    initialTop = parseInt(window.getComputedStyle(imageContainer).top, 10);

    event.preventDefault();
  }
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    imageContainer.style.left = `${initialLeft + deltaX}px`;
    imageContainer.style.top = `${initialTop + deltaY}px`;
  }
});

document.addEventListener('mouseup', (event) => {
  if (event.button === 1 && isDragging) {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
  }
});






// Manejo del zoom
document.addEventListener('wheel', (event) => {
//   event.preventDefault();

  // Ajustar la escala (zoom in/out)
  if (event.deltaY < 0) {
    scale += 0.1; // Acercar
  } else {
    scale = Math.max(0.1, scale - 0.1); // Alejar (evitar escala negativa)
  }

  imageContainer.style.transform = `scale(${scale})`;
});



function calculate_boxes_coord() {
    image = document.getElementsByClassName("image")[0]
    boxes = [...document.getElementsByClassName("box")]

    coords = []

    boxes.forEach((ele, index, arr)=>{
        box_coords = [
            ele.idImage
            ,(parseInt(ele.style.left) + parseInt(ele.style.width)/2) / image.width
            ,(parseInt(ele.style.top) + parseInt(ele.style.height)/2) / image.height
            ,parseInt(ele.style.width) / image.width
            ,parseInt(ele.style.height) / image.height
            
        ]

        coords.push(box_coords)
    })

    return coords;
}

async function save_label(){
    coords = calculate_boxes_coord()

    // Enviar parámetro a Flask
    const respuesta = await fetch("/guardar_label", {
        method: "POST", // Usamos POST para enviar datos
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ coords: coords, image: imagen_actual }) // Enviar como JSON
    });
    [...document.getElementsByClassName("box")].forEach((ele)=>{ele.remove()})
    cargar_imagen_nueva()
}

async function agregar_clase_imagen() {
    // Parámetro a enviar
    const parametro = prompt("di la clase");

    // Enviar parámetro a Flask
    const respuesta = await fetch("/generar_clase", {
        method: "POST", // Usamos POST para enviar datos
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ parametro: parametro }) // Enviar como JSON
    });

    // Manejar la respuesta del servidor
    if (!respuesta.ok) {
        alert("ya existia")
    }else {
        opciones.push([parametro,generarColorAleatorioRGB(), opciones.length -1])

        let opcion = document.createElement("div")
        opcion.innerText = parametro
        opcion.value = parametro
        opcion.color = generarColorAleatorioRGB()
        opcion.idImage = opciones.length -1
        opcion.onclick = ()=>{current_chosen_class_div = opcion}
        opcion.style.borderColor = "rgb("+opcion.color+")"
        opcion.style.background = "rgba("+opcion.color+",0.2)"
        opcion.idImage = index
        index++

        document.getElementById("sidebar").prepend(opcion)
    }
}
//crear menu de opciones de caja


function generarColorAleatorioRGB() {
    const r = Math.floor(Math.random() * 256); // Rojo (0-255)
    const g = Math.floor(Math.random() * 256); // Verde (0-255)
    const b = Math.floor(Math.random() * 256); // Azul (0-255)

    return `${r}, ${g}, ${b}`;
}


function openSidebar() {
    document.getElementById("sidebar").style.width = "250px";
}

function closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
}