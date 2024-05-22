const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const { Firestore } = require('@google-cloud/firestore');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
  
  const { result, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": result,
    "suggestion": suggestion,
    "createdAt": createdAt
}

  await storeData(id, data);

  // response ketika model berhasil di prediksi.
  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data: data
  });

  response.code(201);
  return response;
}

async function getHistoriesHandler(request, h) {
  const db = new Firestore();                            // Inisialisasi objek Firestore
  const predictCollection = db.collection('prediction'); // Ambil koleksi "predictions"
  const predictSnapshot = await predictCollection.get(); // Ambil snapshot dari koleksi

  const data = [];

  predictSnapshot.forEach((doc) => {
      const history = {
          id: doc.id,
          history: doc.data()
      };
      // Tambahkan objek history ke array
      data.push(history);
  });

  const response = h.response({
      status: 'success',
      data: data
  });
  response.code(200);
  return response;
}

module.exports = { postPredictHandler, getHistoriesHandler };

