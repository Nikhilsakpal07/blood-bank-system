const synaptic = require('synaptic');

const predictDemand = (historyData) => {
    const { Layer, Network, Trainer } = synaptic;

    // Create Layers: 1 Input (Day), 3 Hidden Neurons, 1 Output (Units)
    const inputLayer = new Layer(1);
    const hiddenLayer = new Layer(3);
    const outputLayer = new Layer(1);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    const myNetwork = new Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });

    const trainer = new Trainer(myNetwork);

    // Prepare Training Set
    const trainingSet = historyData.map(item => ({
        input: [new Date(item.dispatch_date).getDay() / 7],
        output: [item.units_given / 100] // Normalized to 0-1 range
    }));

    // Train the network
    trainer.train(trainingSet, {
        iterations: 2000,
        error: .005,
        rate: .3
    });

    // Predict for Tomorrow
    const tomorrow = (new Date().getDay() + 1) / 7;
    const result = myNetwork.activate([tomorrow]);

    // Return format matching your frontend expectation
    return { 'O+': result[0] };
};

module.exports = { predictDemand };