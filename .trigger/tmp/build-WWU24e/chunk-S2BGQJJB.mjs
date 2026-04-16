import {
  require_token_error
} from "./chunk-RQYKA76I.mjs";
import {
  __commonJS,
  __name,
  __require,
  init_esm
} from "./chunk-3R76H35D.mjs";

// node_modules/@vercel/oidc/dist/token-io.js
var require_token_io = __commonJS({
  "node_modules/@vercel/oidc/dist/token-io.js"(exports, module) {
    "use strict";
    init_esm();
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name((target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    )), "__toESM");
    var __toCommonJS = /* @__PURE__ */ __name((mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var token_io_exports = {};
    __export(token_io_exports, {
      findRootDir: /* @__PURE__ */ __name(() => findRootDir, "findRootDir"),
      getUserDataDir: /* @__PURE__ */ __name(() => getUserDataDir, "getUserDataDir")
    });
    module.exports = __toCommonJS(token_io_exports);
    var import_path = __toESM(__require("path"));
    var import_fs = __toESM(__require("fs"));
    var import_os = __toESM(__require("os"));
    var import_token_error = require_token_error();
    function findRootDir() {
      try {
        let dir = process.cwd();
        while (dir !== import_path.default.dirname(dir)) {
          const pkgPath = import_path.default.join(dir, ".vercel");
          if (import_fs.default.existsSync(pkgPath)) {
            return dir;
          }
          dir = import_path.default.dirname(dir);
        }
      } catch (e) {
        throw new import_token_error.VercelOidcTokenError(
          "Token refresh only supported in node server environments"
        );
      }
      return null;
    }
    __name(findRootDir, "findRootDir");
    function getUserDataDir() {
      if (process.env.XDG_DATA_HOME) {
        return process.env.XDG_DATA_HOME;
      }
      switch (import_os.default.platform()) {
        case "darwin":
          return import_path.default.join(import_os.default.homedir(), "Library/Application Support");
        case "linux":
          return import_path.default.join(import_os.default.homedir(), ".local/share");
        case "win32":
          if (process.env.LOCALAPPDATA) {
            return process.env.LOCALAPPDATA;
          }
          return null;
        default:
          return null;
      }
    }
    __name(getUserDataDir, "getUserDataDir");
  }
});

// node_modules/@vercel/oidc/dist/auth-config.js
var require_auth_config = __commonJS({
  "node_modules/@vercel/oidc/dist/auth-config.js"(exports, module) {
    "use strict";
    init_esm();
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name((target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    )), "__toESM");
    var __toCommonJS = /* @__PURE__ */ __name((mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var auth_config_exports = {};
    __export(auth_config_exports, {
      isValidAccessToken: /* @__PURE__ */ __name(() => isValidAccessToken, "isValidAccessToken"),
      readAuthConfig: /* @__PURE__ */ __name(() => readAuthConfig, "readAuthConfig"),
      writeAuthConfig: /* @__PURE__ */ __name(() => writeAuthConfig, "writeAuthConfig")
    });
    module.exports = __toCommonJS(auth_config_exports);
    var fs = __toESM(__require("fs"));
    var path = __toESM(__require("path"));
    var import_token_util = require_token_util();
    function getAuthConfigPath() {
      const dataDir = (0, import_token_util.getVercelDataDir)();
      if (!dataDir) {
        throw new Error(
          `Unable to find Vercel CLI data directory. Your platform: ${process.platform}. Supported: darwin, linux, win32.`
        );
      }
      return path.join(dataDir, "auth.json");
    }
    __name(getAuthConfigPath, "getAuthConfigPath");
    function readAuthConfig() {
      try {
        const authPath = getAuthConfigPath();
        if (!fs.existsSync(authPath)) {
          return null;
        }
        const content = fs.readFileSync(authPath, "utf8");
        if (!content) {
          return null;
        }
        return JSON.parse(content);
      } catch (error) {
        return null;
      }
    }
    __name(readAuthConfig, "readAuthConfig");
    function writeAuthConfig(config) {
      const authPath = getAuthConfigPath();
      const authDir = path.dirname(authPath);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { mode: 504, recursive: true });
      }
      fs.writeFileSync(authPath, JSON.stringify(config, null, 2), { mode: 384 });
    }
    __name(writeAuthConfig, "writeAuthConfig");
    function isValidAccessToken(authConfig) {
      if (!authConfig.token)
        return false;
      if (typeof authConfig.expiresAt !== "number")
        return true;
      const nowInSeconds = Math.floor(Date.now() / 1e3);
      return authConfig.expiresAt >= nowInSeconds;
    }
    __name(isValidAccessToken, "isValidAccessToken");
  }
});

// node_modules/@vercel/oidc/dist/oauth.js
var require_oauth = __commonJS({
  "node_modules/@vercel/oidc/dist/oauth.js"(exports, module) {
    "use strict";
    init_esm();
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name((target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toCommonJS = /* @__PURE__ */ __name((mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var oauth_exports = {};
    __export(oauth_exports, {
      processTokenResponse: /* @__PURE__ */ __name(() => processTokenResponse, "processTokenResponse"),
      refreshTokenRequest: /* @__PURE__ */ __name(() => refreshTokenRequest, "refreshTokenRequest")
    });
    module.exports = __toCommonJS(oauth_exports);
    var import_os = __require("os");
    var VERCEL_ISSUER = "https://vercel.com";
    var VERCEL_CLI_CLIENT_ID = "cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp";
    var userAgent = `@vercel/oidc node-${process.version} ${(0, import_os.platform)()} (${(0, import_os.arch)()}) ${(0, import_os.hostname)()}`;
    var _tokenEndpoint = null;
    async function getTokenEndpoint() {
      if (_tokenEndpoint) {
        return _tokenEndpoint;
      }
      const discoveryUrl = `${VERCEL_ISSUER}/.well-known/openid-configuration`;
      const response = await fetch(discoveryUrl, {
        headers: { "user-agent": userAgent }
      });
      if (!response.ok) {
        throw new Error("Failed to discover OAuth endpoints");
      }
      const metadata = await response.json();
      if (!metadata || typeof metadata.token_endpoint !== "string") {
        throw new Error("Invalid OAuth discovery response");
      }
      const endpoint = metadata.token_endpoint;
      _tokenEndpoint = endpoint;
      return endpoint;
    }
    __name(getTokenEndpoint, "getTokenEndpoint");
    async function refreshTokenRequest(options) {
      const tokenEndpoint = await getTokenEndpoint();
      return await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "user-agent": userAgent
        },
        body: new URLSearchParams({
          client_id: VERCEL_CLI_CLIENT_ID,
          grant_type: "refresh_token",
          ...options
        })
      });
    }
    __name(refreshTokenRequest, "refreshTokenRequest");
    async function processTokenResponse(response) {
      const json = await response.json();
      if (!response.ok) {
        const errorMsg = typeof json === "object" && json && "error" in json ? String(json.error) : "Token refresh failed";
        return [new Error(errorMsg)];
      }
      if (typeof json !== "object" || json === null) {
        return [new Error("Invalid token response")];
      }
      if (typeof json.access_token !== "string") {
        return [new Error("Missing access_token in response")];
      }
      if (json.token_type !== "Bearer") {
        return [new Error("Invalid token_type in response")];
      }
      if (typeof json.expires_in !== "number") {
        return [new Error("Missing expires_in in response")];
      }
      return [null, json];
    }
    __name(processTokenResponse, "processTokenResponse");
  }
});

// node_modules/@vercel/oidc/dist/token-util.js
var require_token_util = __commonJS({
  "node_modules/@vercel/oidc/dist/token-util.js"(exports, module) {
    init_esm();
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name((target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    )), "__toESM");
    var __toCommonJS = /* @__PURE__ */ __name((mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var token_util_exports = {};
    __export(token_util_exports, {
      assertVercelOidcTokenResponse: /* @__PURE__ */ __name(() => assertVercelOidcTokenResponse, "assertVercelOidcTokenResponse"),
      findProjectInfo: /* @__PURE__ */ __name(() => findProjectInfo, "findProjectInfo"),
      getTokenPayload: /* @__PURE__ */ __name(() => getTokenPayload, "getTokenPayload"),
      getVercelCliToken: /* @__PURE__ */ __name(() => getVercelCliToken, "getVercelCliToken"),
      getVercelDataDir: /* @__PURE__ */ __name(() => getVercelDataDir, "getVercelDataDir"),
      getVercelOidcToken: /* @__PURE__ */ __name(() => getVercelOidcToken, "getVercelOidcToken"),
      isExpired: /* @__PURE__ */ __name(() => isExpired, "isExpired"),
      loadToken: /* @__PURE__ */ __name(() => loadToken, "loadToken"),
      saveToken: /* @__PURE__ */ __name(() => saveToken, "saveToken")
    });
    module.exports = __toCommonJS(token_util_exports);
    var path = __toESM(__require("path"));
    var fs = __toESM(__require("fs"));
    var import_token_error = require_token_error();
    var import_token_io = require_token_io();
    var import_auth_config = require_auth_config();
    var import_oauth = require_oauth();
    function getVercelDataDir() {
      const vercelFolder = "com.vercel.cli";
      const dataDir = (0, import_token_io.getUserDataDir)();
      if (!dataDir) {
        return null;
      }
      return path.join(dataDir, vercelFolder);
    }
    __name(getVercelDataDir, "getVercelDataDir");
    async function getVercelCliToken() {
      const authConfig = (0, import_auth_config.readAuthConfig)();
      if (!authConfig) {
        return null;
      }
      if ((0, import_auth_config.isValidAccessToken)(authConfig)) {
        return authConfig.token || null;
      }
      if (!authConfig.refreshToken) {
        (0, import_auth_config.writeAuthConfig)({});
        return null;
      }
      try {
        const tokenResponse = await (0, import_oauth.refreshTokenRequest)({
          refresh_token: authConfig.refreshToken
        });
        const [tokensError, tokens] = await (0, import_oauth.processTokenResponse)(tokenResponse);
        if (tokensError || !tokens) {
          (0, import_auth_config.writeAuthConfig)({});
          return null;
        }
        const updatedConfig = {
          token: tokens.access_token,
          expiresAt: Math.floor(Date.now() / 1e3) + tokens.expires_in
        };
        if (tokens.refresh_token) {
          updatedConfig.refreshToken = tokens.refresh_token;
        }
        (0, import_auth_config.writeAuthConfig)(updatedConfig);
        return updatedConfig.token ?? null;
      } catch (error) {
        (0, import_auth_config.writeAuthConfig)({});
        return null;
      }
    }
    __name(getVercelCliToken, "getVercelCliToken");
    async function getVercelOidcToken(authToken, projectId, teamId) {
      const url = `https://api.vercel.com/v1/projects/${projectId}/token?source=vercel-oidc-refresh${teamId ? `&teamId=${teamId}` : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (!res.ok) {
        throw new import_token_error.VercelOidcTokenError(
          `Failed to refresh OIDC token: ${res.statusText}`
        );
      }
      const tokenRes = await res.json();
      assertVercelOidcTokenResponse(tokenRes);
      return tokenRes;
    }
    __name(getVercelOidcToken, "getVercelOidcToken");
    function assertVercelOidcTokenResponse(res) {
      if (!res || typeof res !== "object") {
        throw new TypeError(
          "Vercel OIDC token is malformed. Expected an object. Please run `vc env pull` and try again"
        );
      }
      if (!("token" in res) || typeof res.token !== "string") {
        throw new TypeError(
          "Vercel OIDC token is malformed. Expected a string-valued token property. Please run `vc env pull` and try again"
        );
      }
    }
    __name(assertVercelOidcTokenResponse, "assertVercelOidcTokenResponse");
    function findProjectInfo() {
      const dir = (0, import_token_io.findRootDir)();
      if (!dir) {
        throw new import_token_error.VercelOidcTokenError(
          "Unable to find project root directory. Have you linked your project with `vc link?`"
        );
      }
      const prjPath = path.join(dir, ".vercel", "project.json");
      if (!fs.existsSync(prjPath)) {
        throw new import_token_error.VercelOidcTokenError(
          "project.json not found, have you linked your project with `vc link?`"
        );
      }
      const prj = JSON.parse(fs.readFileSync(prjPath, "utf8"));
      if (typeof prj.projectId !== "string" && typeof prj.orgId !== "string") {
        throw new TypeError(
          "Expected a string-valued projectId property. Try running `vc link` to re-link your project."
        );
      }
      return { projectId: prj.projectId, teamId: prj.orgId };
    }
    __name(findProjectInfo, "findProjectInfo");
    function saveToken(token, projectId) {
      const dir = (0, import_token_io.getUserDataDir)();
      if (!dir) {
        throw new import_token_error.VercelOidcTokenError(
          "Unable to find user data directory. Please reach out to Vercel support."
        );
      }
      const tokenPath = path.join(dir, "com.vercel.token", `${projectId}.json`);
      const tokenJson = JSON.stringify(token);
      fs.mkdirSync(path.dirname(tokenPath), { mode: 504, recursive: true });
      fs.writeFileSync(tokenPath, tokenJson);
      fs.chmodSync(tokenPath, 432);
      return;
    }
    __name(saveToken, "saveToken");
    function loadToken(projectId) {
      const dir = (0, import_token_io.getUserDataDir)();
      if (!dir) {
        throw new import_token_error.VercelOidcTokenError(
          "Unable to find user data directory. Please reach out to Vercel support."
        );
      }
      const tokenPath = path.join(dir, "com.vercel.token", `${projectId}.json`);
      if (!fs.existsSync(tokenPath)) {
        return null;
      }
      const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
      assertVercelOidcTokenResponse(token);
      return token;
    }
    __name(loadToken, "loadToken");
    function getTokenPayload(token) {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new import_token_error.VercelOidcTokenError(
          "Invalid token. Please run `vc env pull` and try again"
        );
      }
      const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + (4 - base64.length % 4) % 4,
        "="
      );
      return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    }
    __name(getTokenPayload, "getTokenPayload");
    function isExpired(token) {
      return token.exp * 1e3 < Date.now();
    }
    __name(isExpired, "isExpired");
  }
});

export {
  require_token_util
};
//# sourceMappingURL=chunk-S2BGQJJB.mjs.map
