const listaNumeros = [1, 2, 31, 4, 5];


let somatorio = listaNumeros.reduce((acumulador, numero) => {
    acumulador += numero;
    return acumulador;
});

console.log("Somatório (funcional)", somatorio); // 43  

// Função para dobrar os números da lista
const dobrarNumeros = (numeros) => {
  return numeros.map(numero => numero * 2);
};

const numerosDobrados = dobrarNumeros(listaNumeros);
console.log("Dobrados (funcional)", numerosDobrados); 


const listaNumerosFiltrados = listaNumeros.filter((numero) => numero >= 2);

console.log("Filtrados (funcional)", listaNumerosFiltrados); // [5]

let maior = listaNumeros[0];


function atualizaMaior(numero) {
    if(numero > maior){
        maior = numero;
    }
}

listaNumeros.forEach(atualizaMaior);

 console.log("Maior (funcional)", maior); // 5

/*
for(let i = 1; i < listaNumeros.length; i++){
    if(listaNumeros[i] > maior){
        maior = listaNumeros[i];
    }
}
console.log(maior); // 5

maior = listaNumeros[0];
for (num in listaNumeros) {
    if(listaNumeros[num] > maior){
        maior = listaNumeros[num];
    }
}
console.log(maior); // 5

*/