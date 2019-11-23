class BloqueDestruible extends Modelo{
    constructor(x,y){
        super(imagenes.bloque_metal,x,y)
        this.x=x;
    }
    getX(){
        return this.x;
    }
}
