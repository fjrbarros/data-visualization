createSvgElement();

function createSvgElement(atualiza, useCurrentData) {
    //Criando o elemento svg
    const svgElement = d3.select('#chart-area').append('svg').attr('id', 'svgElement');

    //Atribuindo propriedades de estilo ao elemento criado
    svgElement.attr('width', '100%')
        .attr('height', '100%');

    getData(atualiza, useCurrentData).then(data => {
        const width = svgElement._groups[0][0].clientWidth;
        const height = svgElement._groups[0][0].clientHeight
        const margin = { top: 50, right: 20, bottom: 90, left: 80 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        svgElement.append('text')
            .attr('x', width / 2 - 200)
            .attr('y', 20)
            .attr('font-size', '18px')
            .attr('fill', 'orange')
            .text('Top 10 moedas mais caras do mundo em 2020.');

        var g = svgElement.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.codigo))
            .range([0, innerWidth])
            .padding(0.05);

        const yScale = d3.scaleLinear()
            .range([innerHeight, 0])
            .domain([0, d3.max(data, d => d.value)]);

        // g.append('text')
        //     .attr('y', innerHeight + 20)
        //     .attr('x', -35)
        //     .attr('text-anchor', 'end')
        //     .attr('fill', 'orange')
        //     .text('Código');

        //Eixo X
        const columnX = g.append('g')
            .attr('transform', `translate(${0}, ${innerHeight+2})`)
            .call(d3.axisBottom(xScale))
            .attr('color', 'orange');

        //Texto das colunas no eixo X
        columnX.selectAll("text")
            .attr("x", 17)
            .attr("y", 15)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .attr('font-size', '15px');

        const columnY = g.append('g')
            .call(d3.axisLeft(yScale)
                .tickFormat(d => `$ ${d}`)
                .ticks(20)
            )
            .attr('font-size', '15px')
            .attr('color', 'orange')

        columnY.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('fill', 'orange')
            .text('Valor')

        const tooltip = svgElement.append('g');

        tooltip.append('text')
            .attr('x', 15)
            .attr('dy', '1.2em')
            .style('font-size', '1em');

        const bars = g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar');

        bars.attr('x', d => xScale(d.codigo))
            .attr('y', innerHeight)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('stroke', 'orange')
            .transition()
            .duration(1000)
            .attr('y', d => yScale(d.value))
            .attr('height', d => innerHeight - yScale(d.value));

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

        bars.on('mouseout', event => {
            tooltip.style('display', 'none');
            resetFill(event, 5);
        });
    });
}

function resetFill(event, value) {
    event.target.style.fill = `rgb(0, 0, 0, 0.${value})`;
}


function checkTime(func) {
    var timer;
    return function(event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 100, event);
    };
}

window.addEventListener('resize', checkTime(() => {
    criaNovoSvg(null, true);
}));

function criaNovoSvg(atualiza, useCurrentData) {
    const svg = document.getElementById('svgElement');

    if (!svg) {
        createSvgElement();
        return;
    }

    svg.parentNode.removeChild(svg);

    createSvgElement(atualiza, useCurrentData);
}

var interval = null;

function atualizaSvg() {
    criaNovoSvg(true);

    interval = setInterval(() => { criaNovoSvg(true) }, 1500);
}

function stopCreateSvg() {
    clearInterval(interval);
}

var currentData = null

function getData(atualiza, useCurrentData) {
    //https://pt.fxssi.com/top-10-as-moedas-mais-caras-do-mundo
    return new Promise(resolve => {
        d3.json('data.json').then(data => {
            if (useCurrentData && currentData) {
                resolve(currentData);
                return;
            }

            if (!atualiza) {
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