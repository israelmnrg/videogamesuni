class GameLayer extends Layer {

    constructor() {
        super();
//        this.mensaje = new Boton(imagenes.mensaje_como_jugar, 480 / 2, 320 / 2);
//        this.pausa = true;
        this.posDefecto='1';
        this.posGuardado='A';
        this.iniciar();
    }

    iniciar() {

        reproducirMusica();

        this.botonSalto = new Boton(imagenes.boton_salto, 480 * 0.9, 320 * 0.55);
        this.botonDisparo = new Boton(imagenes.boton_disparo, 480 * 0.75, 320 * 0.83);
        this.pad = new Pad(480 * 0.14, 320 * 0.8);

        this.espacio = new Espacio(1);

        this.scrollX = 0;


        this.bloques = [];
        this.fondoPuntos =
            new Fondo(imagenes.icono_puntos, 480 * 0.85, 320 * 0.05);

        this.fondoRecolectable= new Fondo(imagenes.recolectable,480*0.2,320*0.08);

        this.puntos = new Texto(0, 480 * 0.8, 320 * 0.07);

        this.ptoRecolectable= new Texto(0,480*0.13,320*0.08)

        //this.jugador = new Jugador(50,50);
        this.fondo = new Fondo(imagenes.fondo_2, 480 * 0.5, 320 * 0.5);
        this.destruibles=[];
        this.destruibles2=[];
        this.puntoGuardados=[];
        this.plataforma=[];
        this.recolectables=[];


        this.enemigos = [];

        //this.enemigos.push(new Enemigo(300,50));
        //this.enemigos.push(new Enemigo(350,200));
        this.cargarMapa("res/" + nivelActual + ".txt");
        this.disparosJugador = []



    }

    cargarMapa(ruta) {
        var fichero = new XMLHttpRequest();

        fichero.open("GET", ruta, false);
        fichero.onreadystatechange = function () {
            var texto = fichero.responseText;
            var lineas = texto.split('\n');
            this.anchoMapa = (lineas[0].length - 1) * 40;
            for (var i = 0; i < lineas.length; i++) {
                var linea = lineas[i];
                for (var j = 0; j < linea.length; j++) {
                    var simbolo = linea[j];
                    var x = 40 / 2 + j * 40; // x central
                    var y = 32 + i * 32; // y de abajo
                    this.cargarObjetoMapa(simbolo, x, y);
                }

            }
        }.bind(this);

        fichero.send(null);
    }

    cargarObjetoMapa(simbolo, x, y) {
        switch (simbolo) {
            case "C":
                this.copa = new Bloque(imagenes.copa, x, y);
                this.copa.y = this.copa.y - this.copa.alto / 2;
                // modificación para empezar a contar desde el suelo
                this.espacio.agregarCuerpoDinamico(this.copa);
                break;
            case "E":
                var enemigo = new Enemigo(x, y);
                enemigo.y = enemigo.y - enemigo.alto / 2;
                // modificación para empezar a contar desde el suelo
                this.enemigos.push(enemigo);
                this.espacio.agregarCuerpoDinamico(enemigo);
                break;
            case "1":
                this.jugador = new Jugador(x, y);
                // modificación para empezar a contar desde el suelo
                this.jugador.y = this.jugador.y - this.jugador.alto / 2;
                this.espacio.agregarCuerpoDinamico(this.jugador);
                break;
            case "#":
                var bloque = new Bloque(imagenes.bloque_tierra, x, y);
                bloque.y = bloque.y - bloque.alto / 2;
                // modificación para empezar a contar desde el suelo
                this.bloques.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "Y":
                var p = new PlataformaSalto(x,y);
                p.y = p.y - p.alto/2;
                this.plataforma.push(p);
                this.espacio.agregarCuerpoEstatico(p);
                break;
            case this.posDefecto:
                this.jugador = new Jugador(x,y);
                this.jugador.y = this.jugador.y-this.jugador.alto/2;
                this.espacio.agregarCuerpoDinamico(this.jugador);
                break;
            case this.posGuardado:
                var pGuardado=new Salvado(x,y);
                pGuardado.y = pGuardado.y-pGuardado.alto/2;
                this.puntoGuardados.push(pGuardado);
                this.espacio.agregarCuerpoDinamico(pGuardado);
                break;
            case "W":
                var b = new BloqueDestruible(x,y);
                b.y = b.y - b.alto/2;
                this.destruibles.push(b);
                this.espacio.agregarCuerpoEstatico(b);
                break;
            case "R":
                var recolectable = new Recolectable( x,y);
                recolectable.y = recolectable.y - recolectable.alto/2;
                this.recolectables.push(recolectable);
                this.espacio.agregarCuerpoDinamico(recolectable);
                break;
            case "U":
                var b = new BloqueDestruible2(x,y);
                b.y = b.y - b.alto/2;
                this.destruibles2.push(b);
                this.espacio.agregarCuerpoEstatico(b);
                break;

        }
    }


    actualizar() {
        if (this.pausa) {
            return;
        }


        if (this.copa.colisiona(this.jugador)) {
            nivelActual++;
            if (nivelActual > nivelMaximo){
                nivelActual = 0;
            }
            //this.pausa = true;
           // this.mensaje =
            //    new Boton(imagenes.mensaje_ganar, 480/2, 320/2);

            this.iniciar();
        }

        // Jugador se cae
        if (this.jugador.y > 320) {
            this.iniciar();
        }


        this.espacio.actualizar();

        //fondo movil
        this.fondo.vx = -1;
        this.fondo.actualizar();

        this.jugador.actualizar();

        // Eliminar disparos sin velocidad
        for (var i = 0; i < this.disparosJugador.length; i++) {
            if (this.disparosJugador[i] != null &&
                this.disparosJugador[i].vx == 0) {

                this.espacio
                    .eliminarCuerpoDinamico(this.disparosJugador[i]);
                this.disparosJugador.splice(i, 1);
            }
        }


        //recorremos la lista de disparos y eliminamos los que estén fuera de la pantalla.
        console.log("disparosJugador: " + this.disparosJugador.length);
        // Eliminar disparos fuera de pantalla
        for (var i = 0; i < this.disparosJugador.length; i++) {
            if (this.disparosJugador[i] != null &&
                !this.disparosJugador[i].estaEnPantalla()) {
                this.espacio
                    .eliminarCuerpoDinamico(this.disparosJugador[i]);

                this.disparosJugador.splice(i, 1);
            }
        }


        for (var i = 0; i < this.enemigos.length; i++) {
            this.enemigos[i].actualizar();
        }

        for (var i=0; i < this.recolectables.length; i++) {
            this.recolectables[i].actualizar();
        }




        //colisiones
        for (var i = 0; i < this.enemigos.length; i++) {
            if (this.enemigos[i].colisiona(this.jugador)) {
                this.iniciar();
            }
        }

        for (var i = 0; i < this.disparosJugador.length; i++) {
            this.disparosJugador[i].actualizar();
        }

        // colisiones , disparoJugador - Enemigo
        for (var i = 0; i < this.disparosJugador.length; i++) {
            for (var j = 0; j < this.enemigos.length; j++) {
                if (this.disparosJugador[i] != null &&
                    this.enemigos[j] != null &&
                    this.disparosJugador[i].colisiona(this.enemigos[j])) {

                    this.espacio
                        .eliminarCuerpoDinamico(this.disparosJugador[i]);

                    this.disparosJugador.splice(i, 1);
                    i = i - 1;
                    this.enemigos[j].impactado();
                    this.puntos.valor++;
                }
            }
        }
        // Enemigos muertos fuera del juego
        for (var j = 0; j < this.enemigos.length; j++) {
            if (this.enemigos[j] != null &&
                this.enemigos[j].estado == estados.muerto) {

                this.espacio
                    .eliminarCuerpoDinamico(this.enemigos[j]);

                this.enemigos.splice(j, 1);
            }
        }

        //Colision jugador - plataformaSalto
        for(var i=0;i<this.plataforma.length;i++){
            if (this.plataforma[i] != null && this.jugador.colisiona(this.plataforma[i])){
                this.jugador.saltar(1.4);
            }
        }

        //Colision jugador - punto salvado
        for(var i=0;i<this.puntoGuardados.length;i++){
            if (this.puntoGuardados[i] != null && this.jugador.colisiona(this.puntoGuardados[i])){
                this.posDefecto=this.posGuardado;
                this.posGuardado="W";
                this.espacio.eliminarCuerpoDinamico(this.puntoGuardados[i]);
                this.puntoGuardados.splice(i,1);
            }
        }

        //Jugador encima bloque destruible
        if(this.iteracionesD==null){
            this.iteracionesD =1;
        }
        for(var i=0;i<this.destruibles.length;i++){
            if ( (this.jugador.getX()/this.destruibles[i].getX()>0.96 && this.jugador.getX()/this.destruibles[i].getX()<1.08)){
                this.iteracionesD ++;
                console.log(this.iteracionesD)
                if(this.iteracionesD >70){
                    this.espacio.eliminarCuerpoEstatico(this.destruibles[i]);
                    this.destruibles.splice(i,1);
                    this.iteracionesD =0;
                }
            }
        }

        //Colision disparoJugador-Bloque
        for (var i = 0; i < this.disparosJugador.length; i++) {
            for (var j = 0; j < this.destruibles2.length; j++) {
                if (this.disparosJugador[i] != null &&
                    this.destruibles2[j] != null &&
                    this.disparosJugador[i].colisiona(this.destruibles2[j])) {
                    this.espacio
                        .eliminarCuerpoDinamico(this.disparosJugador[i]);
                    this.espacio.eliminarCuerpoEstatico(this.destruibles2[j]);
                    this.disparosJugador.splice(i, 1);
                    i = i - 1;
                    this.destruibles2.splice(i,1);
                }
            }
        }

        //Colision jugador - recolectable
        for(var i=0;i<this.recolectables.length;i++){
            if (this.recolectables[i] != null && this.jugador.colisiona(this.recolectables[i])){
                this.espacio.eliminarCuerpoDinamico(this.recolectables[i]);
                this.recolectables.splice(i,1);
                this.ptoRecolectable.valor++;
            }
        }


    }

    calcularScroll() {
        // limite izquierda
        if (this.jugador.x > 480 * 0.3) {
            if (this.jugador.x - this.scrollX < 480 * 0.3) {
                this.scrollX = this.jugador.x - 480 * 0.3;
            }
        }
        // limite derecha
        if (this.jugador.x < this.anchoMapa - 480 * 0.3) {
            if (this.jugador.x - this.scrollX > 480 * 0.7) {
                this.scrollX = this.jugador.x - 480 * 0.7;
            }
        }



    }

    dibujar() {
        this.calcularScroll();
        this.fondo.dibujar();

        for (var i = 0; i < this.bloques.length; i++) {
            this.bloques[i].dibujar(this.scrollX);
        }

        for (var i = 0; i < this.disparosJugador.length; i++) {
            this.disparosJugador[i].dibujar(this.scrollX);
        }

        this.copa.dibujar(this.scrollX);

        for (var i = 0; i < this.enemigos.length; i++) {
            this.enemigos[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.plataforma.length; i++){
            this.plataforma[i].dibujar(this.scrollX);

        }

        for (var i=0; i < this.puntoGuardados.length; i++){
            this.puntoGuardados[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.destruibles.length; i++){
            this.destruibles[i].dibujar(this.scrollX);

        }

        for (var i=0; i < this.destruibles2.length; i++){
            this.destruibles2[i].dibujar(this.scrollX);

        }

        for (var i=0; i < this.recolectables.length; i++){
            this.recolectables[i].dibujar(this.scrollX);
        }

        this.jugador.dibujar(this.scrollX);
        this.fondoPuntos.dibujar();
        this.fondoRecolectable.dibujar();
        this.ptoRecolectable.dibujar();

        this.botonDisparo.dibujar();
        this.botonSalto.dibujar();
        this.pad.dibujar();
        this.puntos.dibujar();

        if (!this.pausa && entrada == entradas.pulsaciones) {
            this.botonDisparo.dibujar();
            this.botonSalto.dibujar();
            this.pad.dibujar();
        }
        if (this.pausa) {
            this.mensaje.dibujar();
        }
    }

    procesarControles() {

        if (controles.continuar) {
            controles.continuar = false;
            this.pausa = false;
        }

        // disparar
        if (controles.disparo) {
            var nuevoDisparo = this.jugador.disparar();
            if (nuevoDisparo != null) {
                this.espacio.agregarCuerpoDinamico(nuevoDisparo);
                this.disparosJugador.push(nuevoDisparo);
            }
            //controles.disparo = false; NO PONER
        }

        // Eje X
        if (controles.moverX > 0) {
            this.jugador.moverX(1);

        } else if (controles.moverX < 0) {
            this.jugador.moverX(-1);

        } else {
            this.jugador.moverX(0);
        }

        // Eje Y
        if (controles.moverY > 0) {
            this.jugador.saltar();

        } else if (controles.moverY < 0) {


        } else {

        }

    }

    calcularPulsaciones(pulsaciones) {
        // Suponemos botones no estan pulsados
        this.botonDisparo.pulsado = false;
        this.botonSalto.pulsado = false;

        // suponemos que el pad está sin tocar
        controles.moverX = 0;
        // Suponemos a false
        controles.continuar = false;


        for (var i = 0; i < pulsaciones.length; i++) {
            // MUY SIMPLE SIN BOTON cualquier click en pantalla lo activa
            if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                controles.continuar = true;
            }

            if (this.pad.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                var orientacionX = this.pad.obtenerOrientacionX(pulsaciones[i].x);
                if (orientacionX > 20) { // de 0 a 20 no contabilizamos
                    controles.moverX = orientacionX;
                }
                if (orientacionX < -20) { // de -20 a 0 no contabilizamos
                    controles.moverX = orientacionX;
                }
            }


            if (this.botonDisparo.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                this.botonDisparo.pulsado = true;
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    controles.disparo = true;
                }
            }

            if (this.botonSalto.contienePunto(pulsaciones[i].x, pulsaciones[i].y)) {
                this.botonSalto.pulsado = true;
                if (pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    controles.moverY = 1;
                }
            }

        }

        // No pulsado - Boton Disparo
        if (!this.botonDisparo.pulsado) {
            controles.disparo = false;
        }

        // No pulsado - Boton Salto
        if (!this.botonSalto.pulsado) {
            controles.moverY = 0;
        }


    }
}

