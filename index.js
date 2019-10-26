const oauthSignature = require("oauth-signature");
const fetch = require("node-fetch");

class Gallery {
  constructor(apiLocation, apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiLocation = apiLocation;
  }

  async getSubscriptionWorkflows() {
    const type = "GET";
    const url = `${this.apiLocation}/workflows/subscription/?`;
    const params = buildOauthParams(this.apiKey);
    const signature = generateSignature(type, url, params, this.apiSecret);
    const newParams = setParams({
      ...params,
      ...{ oauth_signature: signature }
    });
    const response = await fetch(url + newParams);
    return response;
  }

  async getAppQuestions(id) {
    const type = "GET";
    const url = `${this.apiLocation}/workflows/${id}/questions/?`;
    const params = buildOauthParams(this.apiKey);
    const signature = generateSignature(type, url, params, this.apiSecret);
    const newParams = setParams({
      ...params,
      ...{ oauth_signature: signature }
    });
    const response = await fetch(url + newParams);
    return response;
  }

  async executeWorkflow(id, questions) {
    const type = "POST";
    const url = `${this.apiLocation}/workflows/${id}/jobs/?`;
    const params = buildOauthParams(this.apiKey);
    const signature = generateSignature(type, url, params, this.apiSecret);
    const newParams = setParams({
      ...params,
      ...{ oauth_signature: signature }
    });
    const response = await fetch(url + newParams, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ questions: questions })
    });
    return response;
  }

  async getJobsByWorkflow(id) {
    const type = "GET";
    const url = `${this.apiLocation}/workflows/${id}/jobs/?`;
    const params = buildOauthParams(this.apiKey);
    const signature = generateSignature(type, url, params, this.apiSecret);
    const newParams = setParams({
      ...params,
      ...{ oauth_signature: signature }
    });
    const response = await fetch(url + newParams);
    return response;
  }

  async getJob(id) {
    const type = "GET";
    const url = `${this.apiLocation}/jobs/${id}/?`;
    const params = buildOauthParams(this.apiKey);
    const signature = generateSignature(type, url, params, this.apiSecret);
    const newParams = setParams({
      ...params,
      ...{ oauth_signature: signature }
    });
    const response = await fetch(url + newParams);
    return response;
  }

  async getOutputFileURL(jobId, outputId, format) {
    const type = "GET";
    const url = `${this.apiLocation}/jobs/${jobId}/output/${outputId}/?`;
    const params = buildOauthParams(this.apiKey);
    const signature = generateSignature(type, url, params, this.apiSecret);
    const newParams = setParams({
      ...params,
      ...{ format: format || "Raw" },
      ...{ oauth_signature: signature }
    });
    return `${url}${newParams}`;
  }
}

function buildOauthParams(apiKey) {
  return {
    oauth_consumer_key: apiKey,
    oauth_signature_method: "HMAC-SHA1",
    oauth_nonce: Math.floor(Math.random() * 1e9).toString(),
    oauth_timestamp: Math.floor(new Date().getTime() / 1000).toString(),
    oauth_version: "1.0"
  };
}

function generateSignature(httpMethod, url, parameters, secret) {
  return oauthSignature.generate(httpMethod, url, parameters, secret, null, {
    encodeSignature: false
  });
}

function setParams(params) {
  return Object.keys(params)
    .map(function(k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    })
    .join("&");
}

module.exports = Gallery;
