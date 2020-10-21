createSvgElement();

//função responsavel por criar o svg.
function createSvgElement(update, useCurrentData) {
    //Criando o elemento svg
    const svgElement = d3.select('#chart-area').append('svg').attr('id', 'svgElement');

    //Atribuindo propriedades de estilo(largura e altura) ao elemento criado
    svgElement
        .attr('width', '100%')
        .attr('height', '100%');

    //função(promise) que lê os dados e atualiza o svg 
    getData(update, useCurrentData).then(data => {
        //largura do svg
        const width = svgElement._groups[0][0].clientWidth;
        //altura do svg
        const height = svgElement._groups[0][0].clientHeight
            //margens do svg
        const margin = { top: 50, right: 20, bottom: 90, left: 80 };
        //definição da altura do svg menos as margens laterais.
        const innerWidth = width - margin.left - margin.right;
        //definição da altura do svg menos as margens de cima e baixo.
        const innerHeight = height - margin.top - margin.bottom;

        //cria e estiliza o titulo do svg
        svgElement.append('text')
            .attr('x', width / 2 - 200)
            .attr('y', 20)
            .attr('font-size', '18px')
            .attr('fill', 'orange')
            .text('Top 10 moedas mais caras do mundo em 2020.');

        var g = svgElement.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        //aqui é definido o eixo X com base no código da moeda
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.codigo))
            .range([0, innerWidth])
            .padding(0.05);

        //aqui é definido o eixo Y com base no valor da moeda
        const yScale = d3.scaleLinear()
            .range([innerHeight, 0])
            .domain([0, d3.max(data, d => d.value)]);

        // g.append('text')
        //     .attr('y', innerHeight + 20)
        //     .attr('x', -35)
        //     .attr('text-anchor', 'end')
        //     .attr('fill', 'orange')
        //     .text('Código');

        //"linha" de marcação do eixo X
        const columnX = g.append('g')
            .attr('transform', `translate(${0}, ${innerHeight+2})`)
            .call(d3.axisBottom(xScale))
            .attr('color', 'orange');

        //Estilo aplicado nos textos (código) que está no eixo X
        columnX.selectAll("text")
            .attr("x", 17)
            .attr("y", 15)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .attr('font-size', '15px');

        //Textos do eixo Y
        const columnY = g.append('g')
            .call(d3.axisLeft(yScale)
                .tickFormat(d => `$ ${d}`)
                .ticks(20)
            )
            .attr('font-size', '15px')
            .attr('color', 'orange')

        //Texto "Valor" que antecede o eixo Y
        columnY.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -55)
            .attr('fill', 'orange')
            .text('Valor')

        //Criação do tooltip das colunas
        const tooltip = svgElement.append('g');

        //Estilo do texto do tooltip
        tooltip.append('text')
            .attr('x', 15)
            .attr('dy', '1.2em')
            .style('font-size', '1em');

        //Aqui é gerado as colunas (retangulos) com base nos dados
        const bars = g.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar');

        //aqui é aplicado alguns estilos nas barras geradas
        bars
            .attr('x', d => xScale(d.codigo))
            .attr('y', innerHeight)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('stroke', 'orange')
            .transition()
            .duration(1000)
            .attr('y', d => yScale(d.value))
            .attr('height', d => innerHeight - yScale(d.value));

        //Aqui é aplicado um listener na barra para mostrar o tooltip
        bars.on('mousemove', (event, d) => {
            var xPos = event.clientX + 10;
            var yPos = event.clientY;
            if (xPos + 230 > window.innerWidth) {
                xPos = xPos - 280;
                yPos = yPos + 5;
            }
            tooltip.attr('transform', `translate(${xPos}, ${yPos})`);
            tooltip.select('text').text(`${d.name}, valor: ${d.value} R$`);
            tooltip.style('display', 'block')
            tooltip.attr('stroke', 'orange');

            resetFill(event, 7);
        });

        //Aqui é aplicado um listener na barra para esconder o tooltip
        bars.on('mouseout', event => {
            tooltip.style('display', 'none');
            resetFill(event, 5);
        });
    });
}

//troca a cor do background das colunas
function resetFill(event, value) {
    event.target.style.fill = `rgb(0, 0, 0, 0.${value})`;
}

//verifica o tempo de resize da window
function checkTime(func) {
    var timer;
    return function(event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 100, event);
    };
}

//adiciona o listener para verificar o resize da window
window.addEventListener('resize', checkTime(() => {
    createNewSvg(null, true);
}));

//função que verifica se existe um svg criado e cria outro
function createNewSvg(update, useCurrentData) {
    const svg = document.getElementById('svgElement');

    if (!svg) {
        createSvgElement();
        return;
    }

    svg.parentNode.removeChild(svg);

    createSvgElement(update, useCurrentData);
}

var interval = null;

//função que atualiza o svg dinamicamente
function updateSvg() {
    createNewSvg(true);

    interval = setInterval(() => createNewSvg(true), 1500);
}

//função que para a atualização do svg
function stopCreateSvg() {
    clearInterval(interval);
}

var currentData = null

//função que lê o json e trata os dados
function getData(update, useCurrentData) {
    //https://pt.fxssi.com/top-10-as-moedas-mais-caras-do-mundo
    return new Promise(resolve => {
        d3.json('data.json').then(data => {
            if (useCurrentData && currentData) {
                resolve(currentData);
                return;
            }

            if (!update) {
                resolve(data);
                return;
            }

            const min = 0;
            const max = 20;

            data.map(item => item.value = parseFloat((Math.random() * (max - min) + min).toFixed(2)));
            currentData = data;

            resolve(data);
        });

    });
}