const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.kota || "jakarta"; 

    const apiKey = "n9Yl9N8NR6NOrwRw4SAI";

    const url = `https://api.maptiler.com/geocoding/${kota}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);

        const data = response.data;

        if (data.features.length === 0) {
            return res.status(404).json({ message: "Lokasi tidak ditemukan" });
        }

        const feature = data.features[0];
        const koordinat = feature.geometry.coordinates;

        let negara = "-", provinsi = "-", kecamatan = "-";
        
        if (feature.context) {
            feature.context.forEach(c => {
                if (c.id.startsWith("country")) negara = c.text;
                if (c.id.startsWith("region") || c.id.startsWith("province")) provinsi = c.text;
                if (c.id.startsWith("county") || c.id.startsWith("municipality")) kecamatan = c.text;
            });
        }

        res.json({
            negara: negara,
            provinsi: provinsi,
            kecamatan: kecamatan,
            longitude: koordinat[0],
            latitude: koordinat[1]
        });

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            message: "Gagal mengambil data dari MapTiler"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});