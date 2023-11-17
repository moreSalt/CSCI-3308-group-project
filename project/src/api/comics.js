const axios = require("axios");
require("dotenv").config();

// --- READ ME ---
// * make sure you have MARVEL_API_KEY in .env
// * All functions are async
// * If data is not returned, it means something went wrong, check console

// convert the res data to our format. also done to mitigate dynamic type errors
// data is the same as resBody.data.results[i]
const getData = async (data) => {
    try {
        const returnData = {
            id: data.id, // int
            title: data.title, // string
            issueNumber: data.issueNumber, // int
            description: data.description, // string
            upc: data.upc, // string
            seriesID: parseInt(data.series.resourceURI.split("/")[6]), // int
            seriesName: data.series.name, // string
            image: data.thumbnail.path + "." + data.thumbnail.extension, // string
        };
        return returnData;
    } catch (error) {
        console.log(
            `Error converting data to formatted data: ${data.id}`,
            error.message
        );
        return;
    }
};



class MarvelAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.defaultParams = {
            apikey: this.apiKey,
            limit: 20,
        };
        this.headers = {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0",
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Origin: "https://developer.marvel.com",
            DNT: "1",
            Connection: "keep-alive",
            Referer: "https://developer.marvel.com/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "If-None-Match": "e6fcf8ec1fd56fd73e4ff2d62d656718a49d719a",
        };
    }

    async searchComics(params) {
        try {
            const options = {
                method: "GET",
                url: `https://gateway.marvel.com/v1/public/comics`,
                params: this.defaultParams,
                headers: this.headers,
            };

            for (let i = 0; i < params.length; i++) {
                options.params[params[i].key] = params[i].value;
            }

            const res = await axios.request(options);

            const data = [];

            for (let i = 0; i < res.data.data.results.length; i++) {
                const returnData = await getData(res.data.data.results[i]);

                if (!returnData) {
                    continue;
                }

                data.push(returnData);
            }
            return data;
        } catch (error) {
            console.log("Error searching comics:", error.message);
            console.log(error);
        }
    }

    async specificComic(id) {
        try {

            if (parseInt(id) < 0) {
                throw new error("Invalid comic id")
            }
            const options = {
                method: "GET",
                url: `https://gateway.marvel.com/v1/public/comics/${id}`,
                params: this.defaultParams,
                headers: this.headers,
            };

            const res = await axios.request(options);

            const returnData = await getData(res.data.data.results[0]);

            if (!returnData) {
                throw new Error("no data");
            }
            return returnData;
        } catch (error) {
            console.log("Error specific", error.message);
        }
    }
}


module.exports = MarvelAPI;

