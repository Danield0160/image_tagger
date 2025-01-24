from flask import Flask, render_template, request, jsonify, send_file
import json
import tkinter as tk
from tkinter import filedialog
import os
import base64

def seleccionar_directorio():
    root = tk.Tk()
    root.withdraw() 
    directorio = filedialog.askdirectory(title="Selecciona un directorio")
    if directorio:
        return directorio
    else:
        return None
    

app = Flask(__name__)

@app.route("/")
def home():
    global dict_archivo_label
    dict_archivo_label = generar_diccionario_de_archivos(directorio)

    return render_template("index.html", opciones=json.dumps(nombre_de_clases_disponibles))


@app.route("/generar_clase", methods=["POST"])
def procesar():
    # Obtener el parámetro enviado desde JS
    datos = request.json  # Recibir datos en formato JSON
    parametro = datos.get("parametro", None)  # Leer el valor del parámetro

    # Hacer algo con el parámetro
    if parametro not in nombre_de_clases_disponibles:
        with open(os.path.join(directorio, "classes.txt"), "a") as f:
            f.write(parametro + "\n")
            nombre_de_clases_disponibles.append(parametro)

        return jsonify({"mensaje": f"Recibido: {parametro}"})

    return jsonify({"error": f"{parametro} ya existe"})



@app.route("/guardar_label", methods=["POST"])
def guardar_label():
    # Obtener el parámetro enviado desde JS
    datos = request.json  # Recibir datos en formato JSON
    boxes = datos.get("coords", None)  # Leer el valor del parámetro
    image_path = datos.get("image", None)  # Leer el valor del parámetro

    print(boxes, image_path)

    print(image_path)
    label_file_path = os.path.join(directorio, "labels", image_path[0], os.path.splitext(image_path[1])[0]+".txt" )
    with open(label_file_path, "w") as f:
        for box in boxes:
            f.write(" ".join(map(str, box)) + "\n")
    dict_archivo_label[(image_path[0],image_path[1])] = label_file_path

    return jsonify({"mensaje": f"Recibido: {datos}"})



@app.route('/get_image')
def get_image():

    for path, label in dict_archivo_label.items():
        if label == None:
            image_path = f'{directorio}/images/{path[0]}/{path[1]}'  # Ruta de la imagen
            try:
                # Codificar la imagen en base64
                with open(image_path, 'rb') as image_file:
                    image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

                # Crear la lista con el string y la imagen
                response = [
                    path,
                    image_base64
                ]
                return jsonify(response)
            except FileNotFoundError:
                return jsonify({"error": "Imagen no encontrada"}), 404
    return jsonify({"error": "Imagen no encontrada"}), 404
    


@app.route('/get_all_images_name')
def get_all_images_name():
    return list(generar_diccionario_de_archivos(directorio).items())

@app.route('/get_especific_image',methods=["POST"])
def get_especific_image():
    datos = request.json  # Recibir datos en formato JSON
    path1 = datos.get("path1", None)  # Leer el valor del parámetro
    path2 = datos.get("path2", None)  # Leer el valor del parámetro
    image_path = f'{directorio}/images/{path1}/{path2}'

    cajas= []
    path_label = dict_archivo_label[(path1,path2)]
    if path_label and os.path.isfile(path_label):
        with open(dict_archivo_label[(path1,path2)], 'rb') as label_file:
            for linea in label_file.readlines():
                cajas.append(linea.decode('utf-8').strip())  # Elimina caracteres como \r\n



    with open(image_path, 'rb') as image_file:
        image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

        # Crear la lista con el string y la imagen
        response = [
            [path1,path2],
            image_base64,
            cajas
        ]
    return jsonify(response)




# Genera una estructura de carpetas compatible con el formato YOLO
def generar_estructura_carpeta(directorio):

    with open(os.path.join(directorio, "classes.txt"), "w") as f:
        pass
    with open(os.path.join(directorio, "README.txt"), "w") as f:
        pass

    os.mkdir(os.path.join(directorio,"labels"))
    os.mkdir(os.path.join(directorio,"labels","train"))
    os.mkdir(os.path.join(directorio,"labels","val"))
    os.mkdir(os.path.join(directorio,"labels","test"))

    os.mkdir(os.path.join(directorio,"images"))
    os.mkdir(os.path.join(directorio,"images","train"))
    os.mkdir(os.path.join(directorio,"images","val"))
    os.mkdir(os.path.join(directorio,"images","test"))

# Genera un diccionario de todos las imagenes (subdirectorio, filename) => label
def generar_diccionario_de_archivos(directorio):
    diccionario = {}
    for folder in ["train","val","test"]:
        folder_content = os.listdir(os.path.join(directorio,"images",folder))
        for file in folder_content:
            file_label = os.path.join(directorio,"labels",folder,os.path.splitext(file)[0]+".txt")
            if os.path.isfile(file_label):
                diccionario[(folder,file)] = file_label
            else:
                diccionario[(folder,file)] = None

    return diccionario


dict_archivo_label = {}
if __name__ == "__main__":
    # opciones = [
    #     ['gato', '255,0,0', 0], 
    #     ['perro','0,0,255', 1]
    # ]

    directorio = seleccionar_directorio()
    # directorio = "C:/Users/danie/Desktop/test"
    if not directorio:
        exit()

    print(directorio)
    if len(os.listdir(directorio))==0:
        generar_estructura_carpeta(directorio)

    dict_archivo_label = generar_diccionario_de_archivos(directorio)
    print(dict_archivo_label)

    nombre_de_clases_disponibles = []
    with open(os.path.join(directorio, "classes.txt"), "r") as f:
        for line in f.readlines():
            nombre_de_clases_disponibles.append(line[:-1])

    app.run(debug=False)






