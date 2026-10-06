const canvas = document.getElementById('universo');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 60, 110);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfffaed, 2.5, 400);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const UNIVERSOS_KEY = 'multiverso_recuerdos_data_v2';

const PLANETAS_INICIALES = [
    { id: '1', nombre: 'Latido Especial', mensaje: 'desde el primer dia que te vi, mi corazon latio fuerte por ti.', color: '#ff4d4d', tamano: 1.8, decoracion: 'ninguna' },
    { id: '2', nombre: 'Nuestro Primer beso', mensaje: 'Ese momento donde te bese, senti que el mundo se detenia por completo, y tus dulces labios abrazaban a los mios. ', color: '#ff4d4d', tamano: 1.6, decoracion: 'halo' },
    { id: '3', nombre: 'Risas Incontrolables', mensaje: 'Aquel día en el que no podíamos parar de reírnos por cualquier tontería.', color: '#ffa500', tamano: 1.4, decoracion: 'ninguna' },
    { id: '4', nombre: 'Noches Magicas', mensaje: 'Una noche tranquila conversando sobre nuestros sueños y el futuro.', color: '#3399ff', tamano: 2.0, decoracion: 'anillo' },
    { id: '5', nombre: 'Nuestro Primer Desayuno Juntos', mensaje: 'Ese dia en que desperte en tu casa, y desayunamos con tu familia.', color: '#996633', tamano: 1.3, decoracion: 'ninguna' },
    { id: '6', nombre: 'Tiempo Juntos', mensaje: 'Desde el momento en que nuestros caminos se cruzaron, cada segundo a tu lado se convirtio en mi definicion favorita de la felicidad.', color: '#2ecc71', tamano: 1.8, decoracion: 'luna' },
    { id: '7', nombre: 'Promesas en Silencio', mensaje: 'Cuando no hicieron falta palabras para saber que siempre estaríamos el uno para el otro.', color: '#9b59b6', tamano: 1.5, decoracion: 'halo' },
    { id: '8', nombre: 'Orbitas Compartidas', mensaje: 'No medimos el tiempo en horas ni en dias, si no en todas las sonrisas y momentos que compartimos en el camino.', color: '#f1c40f', tamano: 1.7, decoracion: 'anillo' },
    { id: '9', nombre: 'Caminos Entrelazados', mensaje: 'No paro de sorprenderme lo cerca que estuvimos el uno del otro, y a veces pienso si el conocernos fue destino o casualidad.', color: '#1abc9c', tamano: 1.4, decoracion: 'ninguna' },
    { id: '10', nombre: 'Paz', mensaje: 'En los dias mas dificiles, tu voz y compañia fue mi mejor refugio y tranquilidad.', color: '#e67e22', tamano: 1.9, decoracion: 'luna' },
    { id: '11', nombre: 'Nuestro Futuro', mensaje: 'No se que nos deparara el futuro, pero quiero que estes a mi lado en todo momento.', color: '#e84393', tamano: 2.2, decoracion: 'halo' },
    { id: '12', nombre: 'Tus Ojos', mensaje: 'Aquel dia en que mis ojos no podian parar de ver los tuyos, ese dia en que senti que mis ojos brillaban.', color: '#00cec9', tamano: 1.5, decoracion: 'anillo' },
    { id: '13', nombre: 'Noches Tranquilas', mensaje: 'Esos dias donde el silencio nos gana, no hay mucho que contar, pero si mucho por sentir, es compañia jamas la cambiaria.', color: '#6c5ce7', tamano: 1.7, decoracion: 'halo' },
    { id: '14', nombre: 'Tu sonrisa', mensaje: 'Ningun destello de esta galaxia podra igual tu sonrisa.', color: '#fd79a8', tamano: 1.3, decoracion: 'luna' },
    { id: '15', nombre: 'Nuestro Infinito', mensaje: 'Si este multiverso tiene infinitas galaxias, juro que elegiria navegar en todas ella solo para coincidir en el instante en que me regalas un beso', color: '#ffeaa7', tamano: 2.0, decoracion: 'ninguna' }
];

let baseDeDatos = JSON.parse(localStorage.getItem(UNIVERSOS_KEY));

if (!baseDeDatos || !baseDeDatos.universos || Object.keys(baseDeDatos.universos).length === 0 || !baseDeDatos.universos[baseDeDatos.universoActual] || baseDeDatos.universos[baseDeDatos.universoActual].planetas.length === 0) {
    baseDeDatos = {
        universoActual: 'principal',
        universos: {
            'principal': {
                nombre: 'Universo Principal',
                colorFondo: '#ffffff',
                planetas: PLANETAS_INICIALES
            }
        }
    };
    localStorage.setItem(UNIVERSOS_KEY, JSON.stringify(baseDeDatos));
}

function guardarEnLocalStorage() {
    localStorage.setItem(UNIVERSOS_KEY, JSON.stringify(baseDeDatos));
}

let planetas3D = [];
let fondoEstrellas = null;
let planetaSeleccionadoModal = null;

function limpiarEscenaPlanetas() {
    planetas3D.forEach(p => {
        p.pivot.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            }
        });
        scene.remove(p.pivot);
    });
    planetas3D = [];
}

function crearSol() {
    const solGroup = new THREE.Group();
    const geoSol = new THREE.SphereGeometry(6, 32, 32);
    const matSol = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const solMesh = new THREE.Mesh(geoSol, matSol);
    solMesh.userData = {
        esSol: true,
        nombre: 'El Sol de Nuestros Recuerdos',
        mensaje: 'Aquí reside la energía central que mantiene unido todo este universo.'
    };
    solGroup.add(solMesh);
    scene.add(solGroup);
}

function crearFondoEstrellas(colorHex = '#ffffff') {
    if (fondoEstrellas) {
        fondoEstrellas.geometry.dispose();
        fondoEstrellas.material.dispose();
        scene.remove(fondoEstrellas);
    }
    const numEstrellas = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numEstrellas * 3);

    for (let i = 0; i < numEstrellas * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 500;
        positions[i + 1] = (Math.random() - 0.5) * 500;
        positions[i + 2] = (Math.random() - 0.5) * 500;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: new THREE.Color(colorHex),
        size: 0.8,
        transparent: true,
        opacity: 0.8
    });
    fondoEstrellas = new THREE.Points(geometry, material);
    scene.add(fondoEstrellas);
}

function cargarUniversoActual() {
    limpiarEscenaPlanetas();

    const universoData = baseDeDatos.universos[baseDeDatos.universoActual];
    if (!universoData) return;

    crearFondoEstrellas(universoData.colorFondo || '#ffffff');
    const listaPlanetas = universoData.planetas || [];

    listaPlanetas.forEach((pData, index) => {
        const radioOrbita = 14 + (index * 4.8);
        const velocidadOrbita = 0.0025 + (0.0012 * (listaPlanetas.length - index) / Math.max(listaPlanetas.length, 1));

        const pivot = new THREE.Group();
        pivot.rotation.x = (Math.random() - 0.5) * 0.25;
        scene.add(pivot);

        const geometry = new THREE.SphereGeometry(pData.tamano, 32, 32);
        let material;

        if (pData.fotoData) {
            material = new THREE.MeshStandardMaterial({ color: pData.color, roughness: 0.6 });
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(pData.fotoData, (texture) => {
                material.map = texture;
                material.needsUpdate = true;
            });
        } else {
            material = new THREE.MeshStandardMaterial({ color: pData.color, roughness: 0.5 });
        }

        const mesh = new THREE.Mesh(geometry, material);
        const anguloInicial = (index / Math.max(listaPlanetas.length, 1)) * Math.PI * 2;
        mesh.position.set(Math.cos(anguloInicial) * radioOrbita, 0, Math.sin(anguloInicial) * radioOrbita);
        mesh.userData = { ...pData, radioOrbita, velocidadOrbita };
        pivot.add(mesh);

        if (pData.decoracion === 'anillo') {
            const ringGeo = new THREE.RingGeometry(pData.tamano * 1.4, pData.tamano * 2.2, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: pData.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 3;
            mesh.add(ringMesh);
        } else if (pData.decoracion === 'halo') {
            const haloGeo = new THREE.SphereGeometry(pData.tamano * 1.25, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({ color: pData.color, transparent: true, opacity: 0.25 });
            mesh.add(new THREE.Mesh(haloGeo, haloMat));
        } else if (pData.decoracion === 'luna') {
            const lunaGeo = new THREE.SphereGeometry(pData.tamano * 0.25, 16, 16);
            const lunaMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const lunaMesh = new THREE.Mesh(lunaGeo, lunaMat);
            lunaMesh.position.set(pData.tamano * 1.8, 0, 0);
            mesh.add(lunaMesh);
        }

        planetas3D.push({ pivot, mesh });
    });

    actualizarSelectUniversosUI();
    actualizarSelectEditorUI();
    cargarDatosGalaxiaActualUI();
}

function animate() {
    requestAnimationFrame(animate);

    planetas3D.forEach(p => {
        p.pivot.rotation.y += p.mesh.userData.velocidadOrbita;
        p.mesh.rotation.y += 0.01;
    });

    if (fondoEstrellas) fondoEstrellas.rotation.y += 0.0002;
    controls.update();
    renderer.render(scene, camera);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let pointerDownPos = { x: 0, y: 0 };

window.addEventListener('pointerdown', (event) => {
    pointerDownPos = { x: event.clientX, y: event.clientY };
});

window.addEventListener('pointerup', (event) => {
    if (event.target.tagName !== 'CANVAS') return;

    const deltaX = Math.abs(event.clientX - pointerDownPos.x);
    const deltaY = Math.abs(event.clientY - pointerDownPos.y);

    if (deltaX > 5 || deltaY > 5) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;

        while (obj) {
            if (obj.userData && (obj.userData.nombre || obj.userData.esSol)) {
                mostrarModal(obj.userData);
                return;
            }
            obj = obj.parent;
        }
    }
});

function mostrarModal(data) {
    planetaSeleccionadoModal = data;
    document.getElementById('tituloPlaneta').innerText = data.nombre;
    document.getElementById('mensajePlaneta').innerText = data.mensaje;

    const img = document.getElementById('imgPlanetaModal');
    if (data.fotoData) {
        img.src = data.fotoData;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }

    document.getElementById('btnEliminarPlaneta').style.display = data.esSol ? 'none' : 'inline-block';
    document.getElementById('modalPlaneta').classList.remove('panel-oculto');
}

function cerrarModal() {
    document.getElementById('modalPlaneta').classList.add('panel-oculto');
}

function confirmarEliminacion() {
    if (!planetaSeleccionadoModal || planetaSeleccionadoModal.esSol) return;
    
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el planeta "${planetaSeleccionadoModal.nombre}"?`);
    if (confirmacion) {
        const uni = baseDeDatos.universos[baseDeDatos.universoActual];
        uni.planetas = uni.planetas.filter(p => p.id !== planetaSeleccionadoModal.id);
        guardarEnLocalStorage();
        cargarUniversoActual();
        cerrarModal();
    }
}

function ocultarTodosLosPaneles() {
    ['panelCreador', 'panelEditor', 'panelNuevoUniverso', 'panelEditarUniverso'].forEach(id => {
        const p = document.getElementById(id);
        if (p) p.classList.add('panel-oculto');
    });
}

function togglePanel(id) {
    const p = document.getElementById(id);
    if (!p) return;
    const estaOculto = p.classList.contains('panel-oculto');
    ocultarTodosLosPaneles();
    if (estaOculto) p.classList.remove('panel-oculto');
}

function toggleMenuCreador() { togglePanel('panelCreador'); }
function toggleMenuEditor() { togglePanel('panelEditor'); }
function toggleMenuNuevoUniverso() { togglePanel('panelNuevoUniverso'); }
function toggleMenuEditarUniverso() { cargarDatosGalaxiaActualUI(); togglePanel('panelEditarUniverso'); }

function crearPlanetaDesdeUI() {
    const nombre = document.getElementById('inputNombre').value.trim();
    const mensaje = document.getElementById('inputMensaje').value.trim();
    if (!nombre || !mensaje) return alert('Completa el nombre y mensaje.');

    const nuevo = {
        id: Date.now().toString(),
        nombre,
        mensaje,
        color: document.getElementById('inputColor').value,
        tamano: parseFloat(document.getElementById('inputTamano').value),
        decoracion: document.getElementById('selectDecoracion').value,
        fotoData: null
    };

    const fotoInput = document.getElementById('inputFoto');
    const procesar = () => {
        baseDeDatos.universos[baseDeDatos.universoActual].planetas.push(nuevo);
        guardarEnLocalStorage();
        cargarUniversoActual();
        ocultarTodosLosPaneles();
    };

    if (fotoInput && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { nuevo.fotoData = e.target.result; procesar(); };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        procesar();
    }
}

function actualizarSelectEditorUI() {
    const select = document.getElementById('selectPlanetaEditar');
    if (!select) return;
    select.innerHTML = '';
    const planetas = baseDeDatos.universos[baseDeDatos.universoActual].planetas || [];
    planetas.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = p.nombre;
        select.appendChild(opt);
    });
    if (planetas.length > 0) cargarDatosEnEditor();
}

function cargarDatosEnEditor() {
    const id = document.getElementById('selectPlanetaEditar').value;
    const p = baseDeDatos.universos[baseDeDatos.universoActual].planetas.find(x => x.id === id);
    if (p) {
        document.getElementById('editNombre').value = p.nombre;
        document.getElementById('editMensaje').value = p.mensaje;
        document.getElementById('editDecoracion').value = p.decoracion || 'ninguna';
    }
}

function guardarCambiosPlaneta() {
    const id = document.getElementById('selectPlanetaEditar').value;
    const p = baseDeDatos.universos[baseDeDatos.universoActual].planetas.find(x => x.id === id);
    if (!p) return;

    p.nombre = document.getElementById('editNombre').value.trim();
    p.mensaje = document.getElementById('editMensaje').value.trim();
    p.decoracion = document.getElementById('editDecoracion').value;

    const fotoInput = document.getElementById('editFoto');
    const procesar = () => {
        guardarEnLocalStorage();
        cargarUniversoActual();
        ocultarTodosLosPaneles();
    };

    if (fotoInput && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { p.fotoData = e.target.result; procesar(); };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        procesar();
    }
}

function crearNuevoUniversoUI() {
    const nombre = document.getElementById('inputNombreUniverso').value.trim();
    if (!nombre) return alert('Ingresa un nombre para la galaxia.');

    const id = 'uni_' + Date.now();
    baseDeDatos.universos[id] = { nombre, colorFondo: document.getElementById('inputColorGalaxia').value, planetas: [] };
    baseDeDatos.universoActual = id;
    guardarEnLocalStorage();
    cargarUniversoActual();
    ocultarTodosLosPaneles();
}

function cargarDatosGalaxiaActualUI() {
    const uni = baseDeDatos.universos[baseDeDatos.universoActual];
    if (uni) {
        document.getElementById('editNombreGalaxia').value = uni.nombre;
        document.getElementById('editColorGalaxia').value = uni.colorFondo || '#ffffff';
    }
}

function guardarCambiosGalaxiaUI() {
    const uni = baseDeDatos.universos[baseDeDatos.universoActual];
    if (!uni) return;
    uni.nombre = document.getElementById('editNombreGalaxia').value.trim();
    uni.colorFondo = document.getElementById('editColorGalaxia').value;
    guardarEnLocalStorage();
    cargarUniversoActual();
    ocultarTodosLosPaneles();
}

function eliminarGalaxiaActualUI() {
    const keys = Object.keys(baseDeDatos.universos);
    if (keys.length <= 1) return alert('No puedes eliminar la única galaxia existente.');

    const nombreGalaxia = baseDeDatos.universos[baseDeDatos.universoActual].nombre;
    if (confirm(`¿Estás seguro de que deseas eliminar la galaxia "${nombreGalaxia}" y todos sus recuerdos?`)) {
        delete baseDeDatos.universos[baseDeDatos.universoActual];
        baseDeDatos.universoActual = Object.keys(baseDeDatos.universos)[0];
        guardarEnLocalStorage();
        cargarUniversoActual();
        ocultarTodosLosPaneles();
    }
}

function actualizarSelectUniversosUI() {
    const select = document.getElementById('selectUniversoActual');
    if (!select) return;
    select.innerHTML = '';
    Object.keys(baseDeDatos.universos).forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.innerText = baseDeDatos.universos[id].nombre;
        if (id === baseDeDatos.universoActual) opt.selected = true;
        select.appendChild(opt);
    });
}

function cambiarUniverso(id) {
    baseDeDatos.universoActual = id;
    guardarEnLocalStorage();
    cargarUniversoActual();
}

document.getElementById('modalPlaneta').addEventListener('click', (e) => {
    if (e.target.id === 'modalPlaneta') {
        cerrarModal();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

crearSol();
cargarUniversoActual();
animate();