import {
  APICallError,
  InvalidPromptError,
  InvalidResponseDataError,
  TooManyEmbeddingValuesForCallError,
  UnsupportedFunctionalityError,
  combineHeaders,
  convertBase64ToUint8Array,
  convertToBase64,
  convertToFormData,
  createBinaryResponseHandler,
  createEventSourceResponseHandler,
  createJsonErrorResponseHandler,
  createJsonResponseHandler,
  createProviderToolFactory,
  createProviderToolFactoryWithOutputSchema,
  createToolNameMapping,
  downloadBlob,
  external_exports,
  generateId,
  generateText,
  isNonNullable,
  isParsableJson,
  lazySchema,
  loadApiKey,
  loadOptionalSetting,
  mediaTypeToExtension,
  parseJSON,
  parseProviderOptions,
  postFormDataToApi,
  postJsonToApi,
  validateTypes,
  withUserAgentSuffix,
  withoutTrailingSlash,
  zodSchema
} from "../../../../../../chunk-74QZRFK3.mjs";
import "../../../../../../chunk-RQYKA76I.mjs";
import {
  metadata,
  task
} from "../../../../../../chunk-PX67KK3X.mjs";
import "../../../../../../chunk-HCD45DYG.mjs";
import {
  __name,
  init_esm
} from "../../../../../../chunk-3R76H35D.mjs";

// trigger/generate-spec.ts
init_esm();

// node_modules/@ai-sdk/openai/dist/index.mjs
init_esm();
var openaiErrorDataSchema = external_exports.object({
  error: external_exports.object({
    message: external_exports.string(),
    // The additional information below is handled loosely to support
    // OpenAI-compatible providers that have slightly different error
    // responses:
    type: external_exports.string().nullish(),
    param: external_exports.any().nullish(),
    code: external_exports.union([external_exports.string(), external_exports.number()]).nullish()
  })
});
var openaiFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: openaiErrorDataSchema,
  errorToMessage: /* @__PURE__ */ __name((data) => data.error.message, "errorToMessage")
});
function getOpenAILanguageModelCapabilities(modelId) {
  const supportsFlexProcessing = modelId.startsWith("o3") || modelId.startsWith("o4-mini") || modelId.startsWith("gpt-5") && !modelId.startsWith("gpt-5-chat");
  const supportsPriorityProcessing = modelId.startsWith("gpt-4") || modelId.startsWith("gpt-5") && !modelId.startsWith("gpt-5-nano") && !modelId.startsWith("gpt-5-chat") && !modelId.startsWith("gpt-5.4-nano") || modelId.startsWith("o3") || modelId.startsWith("o4-mini");
  const isReasoningModel = modelId.startsWith("o1") || modelId.startsWith("o3") || modelId.startsWith("o4-mini") || modelId.startsWith("gpt-5") && !modelId.startsWith("gpt-5-chat");
  const supportsNonReasoningParameters = modelId.startsWith("gpt-5.1") || modelId.startsWith("gpt-5.2") || modelId.startsWith("gpt-5.3") || modelId.startsWith("gpt-5.4");
  const systemMessageMode = isReasoningModel ? "developer" : "system";
  return {
    supportsFlexProcessing,
    supportsPriorityProcessing,
    isReasoningModel,
    systemMessageMode,
    supportsNonReasoningParameters
  };
}
__name(getOpenAILanguageModelCapabilities, "getOpenAILanguageModelCapabilities");
function convertOpenAIChatUsage(usage) {
  var _a, _b, _c, _d, _e, _f;
  if (usage == null) {
    return {
      inputTokens: {
        total: void 0,
        noCache: void 0,
        cacheRead: void 0,
        cacheWrite: void 0
      },
      outputTokens: {
        total: void 0,
        text: void 0,
        reasoning: void 0
      },
      raw: void 0
    };
  }
  const promptTokens = (_a = usage.prompt_tokens) != null ? _a : 0;
  const completionTokens = (_b = usage.completion_tokens) != null ? _b : 0;
  const cachedTokens = (_d = (_c = usage.prompt_tokens_details) == null ? void 0 : _c.cached_tokens) != null ? _d : 0;
  const reasoningTokens = (_f = (_e = usage.completion_tokens_details) == null ? void 0 : _e.reasoning_tokens) != null ? _f : 0;
  return {
    inputTokens: {
      total: promptTokens,
      noCache: promptTokens - cachedTokens,
      cacheRead: cachedTokens,
      cacheWrite: void 0
    },
    outputTokens: {
      total: completionTokens,
      text: completionTokens - reasoningTokens,
      reasoning: reasoningTokens
    },
    raw: usage
  };
}
__name(convertOpenAIChatUsage, "convertOpenAIChatUsage");
function serializeToolCallArguments(input) {
  return JSON.stringify(input === void 0 ? {} : input);
}
__name(serializeToolCallArguments, "serializeToolCallArguments");
function convertToOpenAIChatMessages({
  prompt,
  systemMessageMode = "system"
}) {
  var _a;
  const messages = [];
  const warnings = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        switch (systemMessageMode) {
          case "system": {
            messages.push({ role: "system", content });
            break;
          }
          case "developer": {
            messages.push({ role: "developer", content });
            break;
          }
          case "remove": {
            warnings.push({
              type: "other",
              message: "system messages are removed for this model"
            });
            break;
          }
          default: {
            const _exhaustiveCheck = systemMessageMode;
            throw new Error(
              `Unsupported system message mode: ${_exhaustiveCheck}`
            );
          }
        }
        break;
      }
      case "user": {
        if (content.length === 1 && content[0].type === "text") {
          messages.push({ role: "user", content: content[0].text });
          break;
        }
        messages.push({
          role: "user",
          content: content.map((part, index) => {
            var _a2, _b, _c;
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "file": {
                if (part.mediaType.startsWith("image/")) {
                  const mediaType = part.mediaType === "image/*" ? "image/jpeg" : part.mediaType;
                  return {
                    type: "image_url",
                    image_url: {
                      url: part.data instanceof URL ? part.data.toString() : `data:${mediaType};base64,${convertToBase64(part.data)}`,
                      // OpenAI specific extension: image detail
                      detail: (_b = (_a2 = part.providerOptions) == null ? void 0 : _a2.openai) == null ? void 0 : _b.imageDetail
                    }
                  };
                } else if (part.mediaType.startsWith("audio/")) {
                  if (part.data instanceof URL) {
                    throw new UnsupportedFunctionalityError({
                      functionality: "audio file parts with URLs"
                    });
                  }
                  switch (part.mediaType) {
                    case "audio/wav": {
                      return {
                        type: "input_audio",
                        input_audio: {
                          data: convertToBase64(part.data),
                          format: "wav"
                        }
                      };
                    }
                    case "audio/mp3":
                    case "audio/mpeg": {
                      return {
                        type: "input_audio",
                        input_audio: {
                          data: convertToBase64(part.data),
                          format: "mp3"
                        }
                      };
                    }
                    default: {
                      throw new UnsupportedFunctionalityError({
                        functionality: `audio content parts with media type ${part.mediaType}`
                      });
                    }
                  }
                } else if (part.mediaType === "application/pdf") {
                  if (part.data instanceof URL) {
                    throw new UnsupportedFunctionalityError({
                      functionality: "PDF file parts with URLs"
                    });
                  }
                  return {
                    type: "file",
                    file: typeof part.data === "string" && part.data.startsWith("file-") ? { file_id: part.data } : {
                      filename: (_c = part.filename) != null ? _c : `part-${index}.pdf`,
                      file_data: `data:application/pdf;base64,${convertToBase64(part.data)}`
                    }
                  };
                } else {
                  throw new UnsupportedFunctionalityError({
                    functionality: `file part media type ${part.mediaType}`
                  });
                }
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        let text = "";
        const toolCalls = [];
        for (const part of content) {
          switch (part.type) {
            case "text": {
              text += part.text;
              break;
            }
            case "tool-call": {
              toolCalls.push({
                id: part.toolCallId,
                type: "function",
                function: {
                  name: part.toolName,
                  arguments: serializeToolCallArguments(part.input)
                }
              });
              break;
            }
          }
        }
        messages.push({
          role: "assistant",
          content: text,
          tool_calls: toolCalls.length > 0 ? toolCalls : void 0
        });
        break;
      }
      case "tool": {
        for (const toolResponse of content) {
          if (toolResponse.type === "tool-approval-response") {
            continue;
          }
          const output = toolResponse.output;
          let contentValue;
          switch (output.type) {
            case "text":
            case "error-text":
              contentValue = output.value;
              break;
            case "execution-denied":
              contentValue = (_a = output.reason) != null ? _a : "Tool execution denied.";
              break;
            case "content":
            case "json":
            case "error-json":
              contentValue = JSON.stringify(output.value);
              break;
          }
          messages.push({
            role: "tool",
            tool_call_id: toolResponse.toolCallId,
            content: contentValue
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return { messages, warnings };
}
__name(convertToOpenAIChatMessages, "convertToOpenAIChatMessages");
function getResponseMetadata({
  id,
  model,
  created
}) {
  return {
    id: id != null ? id : void 0,
    modelId: model != null ? model : void 0,
    timestamp: created ? new Date(created * 1e3) : void 0
  };
}
__name(getResponseMetadata, "getResponseMetadata");
function mapOpenAIFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "other";
  }
}
__name(mapOpenAIFinishReason, "mapOpenAIFinishReason");
var openaiChatResponseSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      id: external_exports.string().nullish(),
      created: external_exports.number().nullish(),
      model: external_exports.string().nullish(),
      choices: external_exports.array(
        external_exports.object({
          message: external_exports.object({
            role: external_exports.literal("assistant").nullish(),
            content: external_exports.string().nullish(),
            tool_calls: external_exports.array(
              external_exports.object({
                id: external_exports.string().nullish(),
                type: external_exports.literal("function"),
                function: external_exports.object({
                  name: external_exports.string(),
                  arguments: external_exports.string()
                })
              })
            ).nullish(),
            annotations: external_exports.array(
              external_exports.object({
                type: external_exports.literal("url_citation"),
                url_citation: external_exports.object({
                  start_index: external_exports.number(),
                  end_index: external_exports.number(),
                  url: external_exports.string(),
                  title: external_exports.string()
                })
              })
            ).nullish()
          }),
          index: external_exports.number(),
          logprobs: external_exports.object({
            content: external_exports.array(
              external_exports.object({
                token: external_exports.string(),
                logprob: external_exports.number(),
                top_logprobs: external_exports.array(
                  external_exports.object({
                    token: external_exports.string(),
                    logprob: external_exports.number()
                  })
                )
              })
            ).nullish()
          }).nullish(),
          finish_reason: external_exports.string().nullish()
        })
      ),
      usage: external_exports.object({
        prompt_tokens: external_exports.number().nullish(),
        completion_tokens: external_exports.number().nullish(),
        total_tokens: external_exports.number().nullish(),
        prompt_tokens_details: external_exports.object({
          cached_tokens: external_exports.number().nullish()
        }).nullish(),
        completion_tokens_details: external_exports.object({
          reasoning_tokens: external_exports.number().nullish(),
          accepted_prediction_tokens: external_exports.number().nullish(),
          rejected_prediction_tokens: external_exports.number().nullish()
        }).nullish()
      }).nullish()
    })
  )
);
var openaiChatChunkSchema = lazySchema(
  () => zodSchema(
    external_exports.union([
      external_exports.object({
        id: external_exports.string().nullish(),
        created: external_exports.number().nullish(),
        model: external_exports.string().nullish(),
        choices: external_exports.array(
          external_exports.object({
            delta: external_exports.object({
              role: external_exports.enum(["assistant"]).nullish(),
              content: external_exports.string().nullish(),
              tool_calls: external_exports.array(
                external_exports.object({
                  index: external_exports.number(),
                  id: external_exports.string().nullish(),
                  type: external_exports.literal("function").nullish(),
                  function: external_exports.object({
                    name: external_exports.string().nullish(),
                    arguments: external_exports.string().nullish()
                  })
                })
              ).nullish(),
              annotations: external_exports.array(
                external_exports.object({
                  type: external_exports.literal("url_citation"),
                  url_citation: external_exports.object({
                    start_index: external_exports.number(),
                    end_index: external_exports.number(),
                    url: external_exports.string(),
                    title: external_exports.string()
                  })
                })
              ).nullish()
            }).nullish(),
            logprobs: external_exports.object({
              content: external_exports.array(
                external_exports.object({
                  token: external_exports.string(),
                  logprob: external_exports.number(),
                  top_logprobs: external_exports.array(
                    external_exports.object({
                      token: external_exports.string(),
                      logprob: external_exports.number()
                    })
                  )
                })
              ).nullish()
            }).nullish(),
            finish_reason: external_exports.string().nullish(),
            index: external_exports.number()
          })
        ),
        usage: external_exports.object({
          prompt_tokens: external_exports.number().nullish(),
          completion_tokens: external_exports.number().nullish(),
          total_tokens: external_exports.number().nullish(),
          prompt_tokens_details: external_exports.object({
            cached_tokens: external_exports.number().nullish()
          }).nullish(),
          completion_tokens_details: external_exports.object({
            reasoning_tokens: external_exports.number().nullish(),
            accepted_prediction_tokens: external_exports.number().nullish(),
            rejected_prediction_tokens: external_exports.number().nullish()
          }).nullish()
        }).nullish()
      }),
      openaiErrorDataSchema
    ])
  )
);
var openaiLanguageModelChatOptions = lazySchema(
  () => zodSchema(
    external_exports.object({
      /**
       * Modify the likelihood of specified tokens appearing in the completion.
       *
       * Accepts a JSON object that maps tokens (specified by their token ID in
       * the GPT tokenizer) to an associated bias value from -100 to 100.
       */
      logitBias: external_exports.record(external_exports.coerce.number(), external_exports.number()).optional(),
      /**
       * Return the log probabilities of the tokens.
       *
       * Setting to true will return the log probabilities of the tokens that
       * were generated.
       *
       * Setting to a number will return the log probabilities of the top n
       * tokens that were generated.
       */
      logprobs: external_exports.union([external_exports.boolean(), external_exports.number()]).optional(),
      /**
       * Whether to enable parallel function calling during tool use. Default to true.
       */
      parallelToolCalls: external_exports.boolean().optional(),
      /**
       * A unique identifier representing your end-user, which can help OpenAI to
       * monitor and detect abuse.
       */
      user: external_exports.string().optional(),
      /**
       * Reasoning effort for reasoning models. Defaults to `medium`.
       */
      reasoningEffort: external_exports.enum(["none", "minimal", "low", "medium", "high", "xhigh"]).optional(),
      /**
       * Maximum number of completion tokens to generate. Useful for reasoning models.
       */
      maxCompletionTokens: external_exports.number().optional(),
      /**
       * Whether to enable persistence in responses API.
       */
      store: external_exports.boolean().optional(),
      /**
       * Metadata to associate with the request.
       */
      metadata: external_exports.record(external_exports.string().max(64), external_exports.string().max(512)).optional(),
      /**
       * Parameters for prediction mode.
       */
      prediction: external_exports.record(external_exports.string(), external_exports.any()).optional(),
      /**
       * Service tier for the request.
       * - 'auto': Default service tier. The request will be processed with the service tier configured in the
       *           Project settings. Unless otherwise configured, the Project will use 'default'.
       * - 'flex': 50% cheaper processing at the cost of increased latency. Only available for o3 and o4-mini models.
       * - 'priority': Higher-speed processing with predictably low latency at premium cost. Available for Enterprise customers.
       * - 'default': The request will be processed with the standard pricing and performance for the selected model.
       *
       * @default 'auto'
       */
      serviceTier: external_exports.enum(["auto", "flex", "priority", "default"]).optional(),
      /**
       * Whether to use strict JSON schema validation.
       *
       * @default true
       */
      strictJsonSchema: external_exports.boolean().optional(),
      /**
       * Controls the verbosity of the model's responses.
       * Lower values will result in more concise responses, while higher values will result in more verbose responses.
       */
      textVerbosity: external_exports.enum(["low", "medium", "high"]).optional(),
      /**
       * A cache key for prompt caching. Allows manual control over prompt caching behavior.
       * Useful for improving cache hit rates and working around automatic caching issues.
       */
      promptCacheKey: external_exports.string().optional(),
      /**
       * The retention policy for the prompt cache.
       * - 'in_memory': Default. Standard prompt caching behavior.
       * - '24h': Extended prompt caching that keeps cached prefixes active for up to 24 hours.
       *          Currently only available for 5.1 series models.
       *
       * @default 'in_memory'
       */
      promptCacheRetention: external_exports.enum(["in_memory", "24h"]).optional(),
      /**
       * A stable identifier used to help detect users of your application
       * that may be violating OpenAI's usage policies. The IDs should be a
       * string that uniquely identifies each user. We recommend hashing their
       * username or email address, in order to avoid sending us any identifying
       * information.
       */
      safetyIdentifier: external_exports.string().optional(),
      /**
       * Override the system message mode for this model.
       * - 'system': Use the 'system' role for system messages (default for most models)
       * - 'developer': Use the 'developer' role for system messages (used by reasoning models)
       * - 'remove': Remove system messages entirely
       *
       * If not specified, the mode is automatically determined based on the model.
       */
      systemMessageMode: external_exports.enum(["system", "developer", "remove"]).optional(),
      /**
       * Force treating this model as a reasoning model.
       *
       * This is useful for "stealth" reasoning models (e.g. via a custom baseURL)
       * where the model ID is not recognized by the SDK's allowlist.
       *
       * When enabled, the SDK applies reasoning-model parameter compatibility rules
       * and defaults `systemMessageMode` to `developer` unless overridden.
       */
      forceReasoning: external_exports.boolean().optional()
    })
  )
);
function prepareChatTools({
  tools,
  toolChoice
}) {
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings };
  }
  const openaiTools2 = [];
  for (const tool of tools) {
    switch (tool.type) {
      case "function":
        openaiTools2.push({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
            ...tool.strict != null ? { strict: tool.strict } : {}
          }
        });
        break;
      default:
        toolWarnings.push({
          type: "unsupported",
          feature: `tool type: ${tool.type}`
        });
        break;
    }
  }
  if (toolChoice == null) {
    return { tools: openaiTools2, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: openaiTools2, toolChoice: type, toolWarnings };
    case "tool":
      return {
        tools: openaiTools2,
        toolChoice: {
          type: "function",
          function: {
            name: toolChoice.toolName
          }
        },
        toolWarnings
      };
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}
__name(prepareChatTools, "prepareChatTools");
var OpenAIChatLanguageModel = class {
  static {
    __name(this, "OpenAIChatLanguageModel");
  }
  constructor(modelId, config) {
    this.specificationVersion = "v3";
    this.supportedUrls = {
      "image/*": [/^https?:\/\/.*$/]
    };
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    tools,
    toolChoice,
    providerOptions
  }) {
    var _a, _b, _c, _d, _e;
    const warnings = [];
    const openaiOptions = (_a = await parseProviderOptions({
      provider: "openai",
      providerOptions,
      schema: openaiLanguageModelChatOptions
    })) != null ? _a : {};
    const modelCapabilities = getOpenAILanguageModelCapabilities(this.modelId);
    const isReasoningModel = (_b = openaiOptions.forceReasoning) != null ? _b : modelCapabilities.isReasoningModel;
    if (topK != null) {
      warnings.push({ type: "unsupported", feature: "topK" });
    }
    const { messages, warnings: messageWarnings } = convertToOpenAIChatMessages(
      {
        prompt,
        systemMessageMode: (_c = openaiOptions.systemMessageMode) != null ? _c : isReasoningModel ? "developer" : modelCapabilities.systemMessageMode
      }
    );
    warnings.push(...messageWarnings);
    const strictJsonSchema = (_d = openaiOptions.strictJsonSchema) != null ? _d : true;
    const baseArgs = {
      // model id:
      model: this.modelId,
      // model specific settings:
      logit_bias: openaiOptions.logitBias,
      logprobs: openaiOptions.logprobs === true || typeof openaiOptions.logprobs === "number" ? true : void 0,
      top_logprobs: typeof openaiOptions.logprobs === "number" ? openaiOptions.logprobs : typeof openaiOptions.logprobs === "boolean" ? openaiOptions.logprobs ? 0 : void 0 : void 0,
      user: openaiOptions.user,
      parallel_tool_calls: openaiOptions.parallelToolCalls,
      // standardized settings:
      max_tokens: maxOutputTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? responseFormat.schema != null ? {
        type: "json_schema",
        json_schema: {
          schema: responseFormat.schema,
          strict: strictJsonSchema,
          name: (_e = responseFormat.name) != null ? _e : "response",
          description: responseFormat.description
        }
      } : { type: "json_object" } : void 0,
      stop: stopSequences,
      seed,
      verbosity: openaiOptions.textVerbosity,
      // openai specific settings:
      // TODO AI SDK 6: remove, we auto-map maxOutputTokens now
      max_completion_tokens: openaiOptions.maxCompletionTokens,
      store: openaiOptions.store,
      metadata: openaiOptions.metadata,
      prediction: openaiOptions.prediction,
      reasoning_effort: openaiOptions.reasoningEffort,
      service_tier: openaiOptions.serviceTier,
      prompt_cache_key: openaiOptions.promptCacheKey,
      prompt_cache_retention: openaiOptions.promptCacheRetention,
      safety_identifier: openaiOptions.safetyIdentifier,
      // messages:
      messages
    };
    if (isReasoningModel) {
      if (openaiOptions.reasoningEffort !== "none" || !modelCapabilities.supportsNonReasoningParameters) {
        if (baseArgs.temperature != null) {
          baseArgs.temperature = void 0;
          warnings.push({
            type: "unsupported",
            feature: "temperature",
            details: "temperature is not supported for reasoning models"
          });
        }
        if (baseArgs.top_p != null) {
          baseArgs.top_p = void 0;
          warnings.push({
            type: "unsupported",
            feature: "topP",
            details: "topP is not supported for reasoning models"
          });
        }
        if (baseArgs.logprobs != null) {
          baseArgs.logprobs = void 0;
          warnings.push({
            type: "other",
            message: "logprobs is not supported for reasoning models"
          });
        }
      }
      if (baseArgs.frequency_penalty != null) {
        baseArgs.frequency_penalty = void 0;
        warnings.push({
          type: "unsupported",
          feature: "frequencyPenalty",
          details: "frequencyPenalty is not supported for reasoning models"
        });
      }
      if (baseArgs.presence_penalty != null) {
        baseArgs.presence_penalty = void 0;
        warnings.push({
          type: "unsupported",
          feature: "presencePenalty",
          details: "presencePenalty is not supported for reasoning models"
        });
      }
      if (baseArgs.logit_bias != null) {
        baseArgs.logit_bias = void 0;
        warnings.push({
          type: "other",
          message: "logitBias is not supported for reasoning models"
        });
      }
      if (baseArgs.top_logprobs != null) {
        baseArgs.top_logprobs = void 0;
        warnings.push({
          type: "other",
          message: "topLogprobs is not supported for reasoning models"
        });
      }
      if (baseArgs.max_tokens != null) {
        if (baseArgs.max_completion_tokens == null) {
          baseArgs.max_completion_tokens = baseArgs.max_tokens;
        }
        baseArgs.max_tokens = void 0;
      }
    } else if (this.modelId.startsWith("gpt-4o-search-preview") || this.modelId.startsWith("gpt-4o-mini-search-preview")) {
      if (baseArgs.temperature != null) {
        baseArgs.temperature = void 0;
        warnings.push({
          type: "unsupported",
          feature: "temperature",
          details: "temperature is not supported for the search preview models and has been removed."
        });
      }
    }
    if (openaiOptions.serviceTier === "flex" && !modelCapabilities.supportsFlexProcessing) {
      warnings.push({
        type: "unsupported",
        feature: "serviceTier",
        details: "flex processing is only available for o3, o4-mini, and gpt-5 models"
      });
      baseArgs.service_tier = void 0;
    }
    if (openaiOptions.serviceTier === "priority" && !modelCapabilities.supportsPriorityProcessing) {
      warnings.push({
        type: "unsupported",
        feature: "serviceTier",
        details: "priority processing is only available for supported models (gpt-4, gpt-5, gpt-5-mini, o3, o4-mini) and requires Enterprise access. gpt-5-nano is not supported"
      });
      baseArgs.service_tier = void 0;
    }
    const {
      tools: openaiTools2,
      toolChoice: openaiToolChoice,
      toolWarnings
    } = prepareChatTools({
      tools,
      toolChoice
    });
    return {
      args: {
        ...baseArgs,
        tools: openaiTools2,
        tool_choice: openaiToolChoice
      },
      warnings: [...warnings, ...toolWarnings]
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { args: body, warnings } = await this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const content = [];
    const text = choice.message.content;
    if (text != null && text.length > 0) {
      content.push({ type: "text", text });
    }
    for (const toolCall of (_a = choice.message.tool_calls) != null ? _a : []) {
      content.push({
        type: "tool-call",
        toolCallId: (_b = toolCall.id) != null ? _b : generateId(),
        toolName: toolCall.function.name,
        input: toolCall.function.arguments
      });
    }
    for (const annotation of (_c = choice.message.annotations) != null ? _c : []) {
      content.push({
        type: "source",
        sourceType: "url",
        id: generateId(),
        url: annotation.url_citation.url,
        title: annotation.url_citation.title
      });
    }
    const completionTokenDetails = (_d = response.usage) == null ? void 0 : _d.completion_tokens_details;
    const promptTokenDetails = (_e = response.usage) == null ? void 0 : _e.prompt_tokens_details;
    const providerMetadata = { openai: {} };
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.accepted_prediction_tokens) != null) {
      providerMetadata.openai.acceptedPredictionTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.accepted_prediction_tokens;
    }
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.rejected_prediction_tokens) != null) {
      providerMetadata.openai.rejectedPredictionTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.rejected_prediction_tokens;
    }
    if (((_f = choice.logprobs) == null ? void 0 : _f.content) != null) {
      providerMetadata.openai.logprobs = choice.logprobs.content;
    }
    return {
      content,
      finishReason: {
        unified: mapOpenAIFinishReason(choice.finish_reason),
        raw: (_g = choice.finish_reason) != null ? _g : void 0
      },
      usage: convertOpenAIChatUsage(response.usage),
      request: { body },
      response: {
        ...getResponseMetadata(response),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings,
      providerMetadata
    };
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs(options);
    const body = {
      ...args,
      stream: true,
      stream_options: {
        include_usage: true
      }
    };
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        openaiChatChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const toolCalls = [];
    let finishReason = {
      unified: "other",
      raw: void 0
    };
    let usage = void 0;
    let metadataExtracted = false;
    let isActiveText = false;
    const providerMetadata = { openai: {} };
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = { unified: "error", raw: void 0 };
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = { unified: "error", raw: void 0 };
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (!metadataExtracted) {
              const metadata2 = getResponseMetadata(value);
              if (Object.values(metadata2).some(Boolean)) {
                metadataExtracted = true;
                controller.enqueue({
                  type: "response-metadata",
                  ...getResponseMetadata(value)
                });
              }
            }
            if (value.usage != null) {
              usage = value.usage;
              if (((_a = value.usage.completion_tokens_details) == null ? void 0 : _a.accepted_prediction_tokens) != null) {
                providerMetadata.openai.acceptedPredictionTokens = (_b = value.usage.completion_tokens_details) == null ? void 0 : _b.accepted_prediction_tokens;
              }
              if (((_c = value.usage.completion_tokens_details) == null ? void 0 : _c.rejected_prediction_tokens) != null) {
                providerMetadata.openai.rejectedPredictionTokens = (_d = value.usage.completion_tokens_details) == null ? void 0 : _d.rejected_prediction_tokens;
              }
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = {
                unified: mapOpenAIFinishReason(choice.finish_reason),
                raw: choice.finish_reason
              };
            }
            if (((_e = choice == null ? void 0 : choice.logprobs) == null ? void 0 : _e.content) != null) {
              providerMetadata.openai.logprobs = choice.logprobs.content;
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            if (delta.content != null) {
              if (!isActiveText) {
                controller.enqueue({ type: "text-start", id: "0" });
                isActiveText = true;
              }
              controller.enqueue({
                type: "text-delta",
                id: "0",
                delta: delta.content
              });
            }
            if (delta.tool_calls != null) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type != null && toolCallDelta.type !== "function") {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`
                    });
                  }
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_f = toolCallDelta.function) == null ? void 0 : _f.name) == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  controller.enqueue({
                    type: "tool-input-start",
                    id: toolCallDelta.id,
                    toolName: toolCallDelta.function.name
                  });
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_g = toolCallDelta.function.arguments) != null ? _g : ""
                    },
                    hasFinished: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (((_h = toolCall2.function) == null ? void 0 : _h.name) != null && ((_i = toolCall2.function) == null ? void 0 : _i.arguments) != null) {
                    if (toolCall2.function.arguments.length > 0) {
                      controller.enqueue({
                        type: "tool-input-delta",
                        id: toolCall2.id,
                        delta: toolCall2.function.arguments
                      });
                    }
                    if (isParsableJson(toolCall2.function.arguments)) {
                      controller.enqueue({
                        type: "tool-input-end",
                        id: toolCall2.id
                      });
                      controller.enqueue({
                        type: "tool-call",
                        toolCallId: (_j = toolCall2.id) != null ? _j : generateId(),
                        toolName: toolCall2.function.name,
                        input: toolCall2.function.arguments
                      });
                      toolCall2.hasFinished = true;
                    }
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall.hasFinished) {
                  continue;
                }
                if (((_k = toolCallDelta.function) == null ? void 0 : _k.arguments) != null) {
                  toolCall.function.arguments += (_m = (_l = toolCallDelta.function) == null ? void 0 : _l.arguments) != null ? _m : "";
                }
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.id,
                  delta: (_n = toolCallDelta.function.arguments) != null ? _n : ""
                });
                if (((_o = toolCall.function) == null ? void 0 : _o.name) != null && ((_p = toolCall.function) == null ? void 0 : _p.arguments) != null && isParsableJson(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-input-end",
                    id: toolCall.id
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: (_q = toolCall.id) != null ? _q : generateId(),
                    toolName: toolCall.function.name,
                    input: toolCall.function.arguments
                  });
                  toolCall.hasFinished = true;
                }
              }
            }
            if (delta.annotations != null) {
              for (const annotation of delta.annotations) {
                controller.enqueue({
                  type: "source",
                  sourceType: "url",
                  id: generateId(),
                  url: annotation.url_citation.url,
                  title: annotation.url_citation.title
                });
              }
            }
          },
          flush(controller) {
            if (isActiveText) {
              controller.enqueue({ type: "text-end", id: "0" });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage: convertOpenAIChatUsage(usage),
              ...providerMetadata != null ? { providerMetadata } : {}
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
function convertOpenAICompletionUsage(usage) {
  var _a, _b, _c, _d;
  if (usage == null) {
    return {
      inputTokens: {
        total: void 0,
        noCache: void 0,
        cacheRead: void 0,
        cacheWrite: void 0
      },
      outputTokens: {
        total: void 0,
        text: void 0,
        reasoning: void 0
      },
      raw: void 0
    };
  }
  const promptTokens = (_a = usage.prompt_tokens) != null ? _a : 0;
  const completionTokens = (_b = usage.completion_tokens) != null ? _b : 0;
  return {
    inputTokens: {
      total: (_c = usage.prompt_tokens) != null ? _c : void 0,
      noCache: promptTokens,
      cacheRead: void 0,
      cacheWrite: void 0
    },
    outputTokens: {
      total: (_d = usage.completion_tokens) != null ? _d : void 0,
      text: completionTokens,
      reasoning: void 0
    },
    raw: usage
  };
}
__name(convertOpenAICompletionUsage, "convertOpenAICompletionUsage");
function convertToOpenAICompletionPrompt({
  prompt,
  user = "user",
  assistant = "assistant"
}) {
  let text = "";
  if (prompt[0].role === "system") {
    text += `${prompt[0].content}

`;
    prompt = prompt.slice(1);
  }
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        throw new InvalidPromptError({
          message: "Unexpected system message in prompt: ${content}",
          prompt
        });
      }
      case "user": {
        const userMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
          }
        }).filter(Boolean).join("");
        text += `${user}:
${userMessage}

`;
        break;
      }
      case "assistant": {
        const assistantMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "tool-call": {
              throw new UnsupportedFunctionalityError({
                functionality: "tool-call messages"
              });
            }
          }
        }).join("");
        text += `${assistant}:
${assistantMessage}

`;
        break;
      }
      case "tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "tool messages"
        });
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  text += `${assistant}:
`;
  return {
    prompt: text,
    stopSequences: [`
${user}:`]
  };
}
__name(convertToOpenAICompletionPrompt, "convertToOpenAICompletionPrompt");
function getResponseMetadata2({
  id,
  model,
  created
}) {
  return {
    id: id != null ? id : void 0,
    modelId: model != null ? model : void 0,
    timestamp: created != null ? new Date(created * 1e3) : void 0
  };
}
__name(getResponseMetadata2, "getResponseMetadata2");
function mapOpenAIFinishReason2(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "other";
  }
}
__name(mapOpenAIFinishReason2, "mapOpenAIFinishReason2");
var openaiCompletionResponseSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      id: external_exports.string().nullish(),
      created: external_exports.number().nullish(),
      model: external_exports.string().nullish(),
      choices: external_exports.array(
        external_exports.object({
          text: external_exports.string(),
          finish_reason: external_exports.string(),
          logprobs: external_exports.object({
            tokens: external_exports.array(external_exports.string()),
            token_logprobs: external_exports.array(external_exports.number()),
            top_logprobs: external_exports.array(external_exports.record(external_exports.string(), external_exports.number())).nullish()
          }).nullish()
        })
      ),
      usage: external_exports.object({
        prompt_tokens: external_exports.number(),
        completion_tokens: external_exports.number(),
        total_tokens: external_exports.number()
      }).nullish()
    })
  )
);
var openaiCompletionChunkSchema = lazySchema(
  () => zodSchema(
    external_exports.union([
      external_exports.object({
        id: external_exports.string().nullish(),
        created: external_exports.number().nullish(),
        model: external_exports.string().nullish(),
        choices: external_exports.array(
          external_exports.object({
            text: external_exports.string(),
            finish_reason: external_exports.string().nullish(),
            index: external_exports.number(),
            logprobs: external_exports.object({
              tokens: external_exports.array(external_exports.string()),
              token_logprobs: external_exports.array(external_exports.number()),
              top_logprobs: external_exports.array(external_exports.record(external_exports.string(), external_exports.number())).nullish()
            }).nullish()
          })
        ),
        usage: external_exports.object({
          prompt_tokens: external_exports.number(),
          completion_tokens: external_exports.number(),
          total_tokens: external_exports.number()
        }).nullish()
      }),
      openaiErrorDataSchema
    ])
  )
);
var openaiLanguageModelCompletionOptions = lazySchema(
  () => zodSchema(
    external_exports.object({
      /**
       * Echo back the prompt in addition to the completion.
       */
      echo: external_exports.boolean().optional(),
      /**
       * Modify the likelihood of specified tokens appearing in the completion.
       *
       * Accepts a JSON object that maps tokens (specified by their token ID in
       * the GPT tokenizer) to an associated bias value from -100 to 100. You
       * can use this tokenizer tool to convert text to token IDs. Mathematically,
       * the bias is added to the logits generated by the model prior to sampling.
       * The exact effect will vary per model, but values between -1 and 1 should
       * decrease or increase likelihood of selection; values like -100 or 100
       * should result in a ban or exclusive selection of the relevant token.
       *
       * As an example, you can pass {"50256": -100} to prevent the <|endoftext|>
       * token from being generated.
       */
      logitBias: external_exports.record(external_exports.string(), external_exports.number()).optional(),
      /**
       * The suffix that comes after a completion of inserted text.
       */
      suffix: external_exports.string().optional(),
      /**
       * A unique identifier representing your end-user, which can help OpenAI to
       * monitor and detect abuse. Learn more.
       */
      user: external_exports.string().optional(),
      /**
       * Return the log probabilities of the tokens. Including logprobs will increase
       * the response size and can slow down response times. However, it can
       * be useful to better understand how the model is behaving.
       * Setting to true will return the log probabilities of the tokens that
       * were generated.
       * Setting to a number will return the log probabilities of the top n
       * tokens that were generated.
       */
      logprobs: external_exports.union([external_exports.boolean(), external_exports.number()]).optional()
    })
  )
);
var OpenAICompletionLanguageModel = class {
  static {
    __name(this, "OpenAICompletionLanguageModel");
  }
  constructor(modelId, config) {
    this.specificationVersion = "v3";
    this.supportedUrls = {
      // No URLs are supported for completion models.
    };
    this.modelId = modelId;
    this.config = config;
  }
  get providerOptionsName() {
    return this.config.provider.split(".")[0].trim();
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences: userStopSequences,
    responseFormat,
    tools,
    toolChoice,
    seed,
    providerOptions
  }) {
    const warnings = [];
    const openaiOptions = {
      ...await parseProviderOptions({
        provider: "openai",
        providerOptions,
        schema: openaiLanguageModelCompletionOptions
      }),
      ...await parseProviderOptions({
        provider: this.providerOptionsName,
        providerOptions,
        schema: openaiLanguageModelCompletionOptions
      })
    };
    if (topK != null) {
      warnings.push({ type: "unsupported", feature: "topK" });
    }
    if (tools == null ? void 0 : tools.length) {
      warnings.push({ type: "unsupported", feature: "tools" });
    }
    if (toolChoice != null) {
      warnings.push({ type: "unsupported", feature: "toolChoice" });
    }
    if (responseFormat != null && responseFormat.type !== "text") {
      warnings.push({
        type: "unsupported",
        feature: "responseFormat",
        details: "JSON response format is not supported."
      });
    }
    const { prompt: completionPrompt, stopSequences } = convertToOpenAICompletionPrompt({ prompt });
    const stop = [...stopSequences != null ? stopSequences : [], ...userStopSequences != null ? userStopSequences : []];
    return {
      args: {
        // model id:
        model: this.modelId,
        // model specific settings:
        echo: openaiOptions.echo,
        logit_bias: openaiOptions.logitBias,
        logprobs: (openaiOptions == null ? void 0 : openaiOptions.logprobs) === true ? 0 : (openaiOptions == null ? void 0 : openaiOptions.logprobs) === false ? void 0 : openaiOptions == null ? void 0 : openaiOptions.logprobs,
        suffix: openaiOptions.suffix,
        user: openaiOptions.user,
        // standardized settings:
        max_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        seed,
        // prompt:
        prompt: completionPrompt,
        // stop sequences:
        stop: stop.length > 0 ? stop : void 0
      },
      warnings
    };
  }
  async doGenerate(options) {
    var _a;
    const { args, warnings } = await this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiCompletionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const providerMetadata = { openai: {} };
    if (choice.logprobs != null) {
      providerMetadata.openai.logprobs = choice.logprobs;
    }
    return {
      content: [{ type: "text", text: choice.text }],
      usage: convertOpenAICompletionUsage(response.usage),
      finishReason: {
        unified: mapOpenAIFinishReason2(choice.finish_reason),
        raw: (_a = choice.finish_reason) != null ? _a : void 0
      },
      request: { body: args },
      response: {
        ...getResponseMetadata2(response),
        headers: responseHeaders,
        body: rawResponse
      },
      providerMetadata,
      warnings
    };
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs(options);
    const body = {
      ...args,
      stream: true,
      stream_options: {
        include_usage: true
      }
    };
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        openaiCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    let finishReason = {
      unified: "other",
      raw: void 0
    };
    const providerMetadata = { openai: {} };
    let usage = void 0;
    let isFirstChunk = true;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = { unified: "error", raw: void 0 };
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = { unified: "error", raw: void 0 };
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata2(value)
              });
              controller.enqueue({ type: "text-start", id: "0" });
            }
            if (value.usage != null) {
              usage = value.usage;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = {
                unified: mapOpenAIFinishReason2(choice.finish_reason),
                raw: choice.finish_reason
              };
            }
            if ((choice == null ? void 0 : choice.logprobs) != null) {
              providerMetadata.openai.logprobs = choice.logprobs;
            }
            if ((choice == null ? void 0 : choice.text) != null && choice.text.length > 0) {
              controller.enqueue({
                type: "text-delta",
                id: "0",
                delta: choice.text
              });
            }
          },
          flush(controller) {
            if (!isFirstChunk) {
              controller.enqueue({ type: "text-end", id: "0" });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              providerMetadata,
              usage: convertOpenAICompletionUsage(usage)
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
var openaiEmbeddingModelOptions = lazySchema(
  () => zodSchema(
    external_exports.object({
      /**
       * The number of dimensions the resulting output embeddings should have.
       * Only supported in text-embedding-3 and later models.
       */
      dimensions: external_exports.number().optional(),
      /**
       * A unique identifier representing your end-user, which can help OpenAI to
       * monitor and detect abuse. Learn more.
       */
      user: external_exports.string().optional()
    })
  )
);
var openaiTextEmbeddingResponseSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      data: external_exports.array(external_exports.object({ embedding: external_exports.array(external_exports.number()) })),
      usage: external_exports.object({ prompt_tokens: external_exports.number() }).nullish()
    })
  )
);
var OpenAIEmbeddingModel = class {
  static {
    __name(this, "OpenAIEmbeddingModel");
  }
  constructor(modelId, config) {
    this.specificationVersion = "v3";
    this.maxEmbeddingsPerCall = 2048;
    this.supportsParallelCalls = true;
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async doEmbed({
    values,
    headers,
    abortSignal,
    providerOptions
  }) {
    var _a;
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values
      });
    }
    const openaiOptions = (_a = await parseProviderOptions({
      provider: "openai",
      providerOptions,
      schema: openaiEmbeddingModelOptions
    })) != null ? _a : {};
    const {
      responseHeaders,
      value: response,
      rawValue
    } = await postJsonToApi({
      url: this.config.url({
        path: "/embeddings",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), headers),
      body: {
        model: this.modelId,
        input: values,
        encoding_format: "float",
        dimensions: openaiOptions.dimensions,
        user: openaiOptions.user
      },
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiTextEmbeddingResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      warnings: [],
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage ? { tokens: response.usage.prompt_tokens } : void 0,
      response: { headers: responseHeaders, body: rawValue }
    };
  }
};
var openaiImageResponseSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      created: external_exports.number().nullish(),
      data: external_exports.array(
        external_exports.object({
          b64_json: external_exports.string(),
          revised_prompt: external_exports.string().nullish()
        })
      ),
      background: external_exports.string().nullish(),
      output_format: external_exports.string().nullish(),
      size: external_exports.string().nullish(),
      quality: external_exports.string().nullish(),
      usage: external_exports.object({
        input_tokens: external_exports.number().nullish(),
        output_tokens: external_exports.number().nullish(),
        total_tokens: external_exports.number().nullish(),
        input_tokens_details: external_exports.object({
          image_tokens: external_exports.number().nullish(),
          text_tokens: external_exports.number().nullish()
        }).nullish()
      }).nullish()
    })
  )
);
var modelMaxImagesPerCall = {
  "dall-e-3": 1,
  "dall-e-2": 10,
  "gpt-image-1": 10,
  "gpt-image-1-mini": 10,
  "gpt-image-1.5": 10,
  "chatgpt-image-latest": 10
};
var defaultResponseFormatPrefixes = [
  "chatgpt-image-",
  "gpt-image-1-mini",
  "gpt-image-1.5",
  "gpt-image-1"
];
function hasDefaultResponseFormat(modelId) {
  return defaultResponseFormatPrefixes.some(
    (prefix) => modelId.startsWith(prefix)
  );
}
__name(hasDefaultResponseFormat, "hasDefaultResponseFormat");
var OpenAIImageModel = class {
  static {
    __name(this, "OpenAIImageModel");
  }
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v3";
  }
  get maxImagesPerCall() {
    var _a;
    return (_a = modelMaxImagesPerCall[this.modelId]) != null ? _a : 1;
  }
  get provider() {
    return this.config.provider;
  }
  async doGenerate({
    prompt,
    files,
    mask,
    n,
    size,
    aspectRatio,
    seed,
    providerOptions,
    headers,
    abortSignal
  }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const warnings = [];
    if (aspectRatio != null) {
      warnings.push({
        type: "unsupported",
        feature: "aspectRatio",
        details: "This model does not support aspect ratio. Use `size` instead."
      });
    }
    if (seed != null) {
      warnings.push({ type: "unsupported", feature: "seed" });
    }
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    if (files != null) {
      const { value: response2, responseHeaders: responseHeaders2 } = await postFormDataToApi({
        url: this.config.url({
          path: "/images/edits",
          modelId: this.modelId
        }),
        headers: combineHeaders(this.config.headers(), headers),
        formData: convertToFormData({
          model: this.modelId,
          prompt,
          image: await Promise.all(
            files.map(
              (file) => file.type === "file" ? new Blob(
                [
                  file.data instanceof Uint8Array ? new Blob([file.data], {
                    type: file.mediaType
                  }) : new Blob([convertBase64ToUint8Array(file.data)], {
                    type: file.mediaType
                  })
                ],
                { type: file.mediaType }
              ) : downloadBlob(file.url)
            )
          ),
          mask: mask != null ? await fileToBlob(mask) : void 0,
          n,
          size,
          ...(_d = providerOptions.openai) != null ? _d : {}
        }),
        failedResponseHandler: openaiFailedResponseHandler,
        successfulResponseHandler: createJsonResponseHandler(
          openaiImageResponseSchema
        ),
        abortSignal,
        fetch: this.config.fetch
      });
      return {
        images: response2.data.map((item) => item.b64_json),
        warnings,
        usage: response2.usage != null ? {
          inputTokens: (_e = response2.usage.input_tokens) != null ? _e : void 0,
          outputTokens: (_f = response2.usage.output_tokens) != null ? _f : void 0,
          totalTokens: (_g = response2.usage.total_tokens) != null ? _g : void 0
        } : void 0,
        response: {
          timestamp: currentDate,
          modelId: this.modelId,
          headers: responseHeaders2
        },
        providerMetadata: {
          openai: {
            images: response2.data.map((item, index) => {
              var _a2, _b2, _c2, _d2, _e2, _f2;
              return {
                ...item.revised_prompt ? { revisedPrompt: item.revised_prompt } : {},
                created: (_a2 = response2.created) != null ? _a2 : void 0,
                size: (_b2 = response2.size) != null ? _b2 : void 0,
                quality: (_c2 = response2.quality) != null ? _c2 : void 0,
                background: (_d2 = response2.background) != null ? _d2 : void 0,
                outputFormat: (_e2 = response2.output_format) != null ? _e2 : void 0,
                ...distributeTokenDetails(
                  (_f2 = response2.usage) == null ? void 0 : _f2.input_tokens_details,
                  index,
                  response2.data.length
                )
              };
            })
          }
        }
      };
    }
    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: "/images/generations",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), headers),
      body: {
        model: this.modelId,
        prompt,
        n,
        size,
        ...(_h = providerOptions.openai) != null ? _h : {},
        ...!hasDefaultResponseFormat(this.modelId) ? { response_format: "b64_json" } : {}
      },
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiImageResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      images: response.data.map((item) => item.b64_json),
      warnings,
      usage: response.usage != null ? {
        inputTokens: (_i = response.usage.input_tokens) != null ? _i : void 0,
        outputTokens: (_j = response.usage.output_tokens) != null ? _j : void 0,
        totalTokens: (_k = response.usage.total_tokens) != null ? _k : void 0
      } : void 0,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders
      },
      providerMetadata: {
        openai: {
          images: response.data.map((item, index) => {
            var _a2, _b2, _c2, _d2, _e2, _f2;
            return {
              ...item.revised_prompt ? { revisedPrompt: item.revised_prompt } : {},
              created: (_a2 = response.created) != null ? _a2 : void 0,
              size: (_b2 = response.size) != null ? _b2 : void 0,
              quality: (_c2 = response.quality) != null ? _c2 : void 0,
              background: (_d2 = response.background) != null ? _d2 : void 0,
              outputFormat: (_e2 = response.output_format) != null ? _e2 : void 0,
              ...distributeTokenDetails(
                (_f2 = response.usage) == null ? void 0 : _f2.input_tokens_details,
                index,
                response.data.length
              )
            };
          })
        }
      }
    };
  }
};
function distributeTokenDetails(details, index, total) {
  if (details == null) {
    return {};
  }
  const result = {};
  if (details.image_tokens != null) {
    const base = Math.floor(details.image_tokens / total);
    const remainder = details.image_tokens - base * (total - 1);
    result.imageTokens = index === total - 1 ? remainder : base;
  }
  if (details.text_tokens != null) {
    const base = Math.floor(details.text_tokens / total);
    const remainder = details.text_tokens - base * (total - 1);
    result.textTokens = index === total - 1 ? remainder : base;
  }
  return result;
}
__name(distributeTokenDetails, "distributeTokenDetails");
async function fileToBlob(file) {
  if (!file) return void 0;
  if (file.type === "url") {
    return downloadBlob(file.url);
  }
  const data = file.data instanceof Uint8Array ? file.data : convertBase64ToUint8Array(file.data);
  return new Blob([data], { type: file.mediaType });
}
__name(fileToBlob, "fileToBlob");
var applyPatchInputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      callId: external_exports.string(),
      operation: external_exports.discriminatedUnion("type", [
        external_exports.object({
          type: external_exports.literal("create_file"),
          path: external_exports.string(),
          diff: external_exports.string()
        }),
        external_exports.object({
          type: external_exports.literal("delete_file"),
          path: external_exports.string()
        }),
        external_exports.object({
          type: external_exports.literal("update_file"),
          path: external_exports.string(),
          diff: external_exports.string()
        })
      ])
    })
  )
);
var applyPatchOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      status: external_exports.enum(["completed", "failed"]),
      output: external_exports.string().optional()
    })
  )
);
var applyPatchArgsSchema = lazySchema(() => zodSchema(external_exports.object({})));
var applyPatchToolFactory = createProviderToolFactoryWithOutputSchema({
  id: "openai.apply_patch",
  inputSchema: applyPatchInputSchema,
  outputSchema: applyPatchOutputSchema
});
var applyPatch = applyPatchToolFactory;
var codeInterpreterInputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      code: external_exports.string().nullish(),
      containerId: external_exports.string()
    })
  )
);
var codeInterpreterOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      outputs: external_exports.array(
        external_exports.discriminatedUnion("type", [
          external_exports.object({ type: external_exports.literal("logs"), logs: external_exports.string() }),
          external_exports.object({ type: external_exports.literal("image"), url: external_exports.string() })
        ])
      ).nullish()
    })
  )
);
var codeInterpreterArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      container: external_exports.union([
        external_exports.string(),
        external_exports.object({
          fileIds: external_exports.array(external_exports.string()).optional()
        })
      ]).optional()
    })
  )
);
var codeInterpreterToolFactory = createProviderToolFactoryWithOutputSchema({
  id: "openai.code_interpreter",
  inputSchema: codeInterpreterInputSchema,
  outputSchema: codeInterpreterOutputSchema
});
var codeInterpreter = /* @__PURE__ */ __name((args = {}) => {
  return codeInterpreterToolFactory(args);
}, "codeInterpreter");
var customArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      name: external_exports.string(),
      description: external_exports.string().optional(),
      format: external_exports.union([
        external_exports.object({
          type: external_exports.literal("grammar"),
          syntax: external_exports.enum(["regex", "lark"]),
          definition: external_exports.string()
        }),
        external_exports.object({
          type: external_exports.literal("text")
        })
      ]).optional()
    })
  )
);
var customInputSchema = lazySchema(() => zodSchema(external_exports.string()));
var customToolFactory = createProviderToolFactory({
  id: "openai.custom",
  inputSchema: customInputSchema
});
var customTool = /* @__PURE__ */ __name((args) => customToolFactory(args), "customTool");
var comparisonFilterSchema = external_exports.object({
  key: external_exports.string(),
  type: external_exports.enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"]),
  value: external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean(), external_exports.array(external_exports.string())])
});
var compoundFilterSchema = external_exports.object({
  type: external_exports.enum(["and", "or"]),
  filters: external_exports.array(
    external_exports.union([comparisonFilterSchema, external_exports.lazy(() => compoundFilterSchema)])
  )
});
var fileSearchArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      vectorStoreIds: external_exports.array(external_exports.string()),
      maxNumResults: external_exports.number().optional(),
      ranking: external_exports.object({
        ranker: external_exports.string().optional(),
        scoreThreshold: external_exports.number().optional()
      }).optional(),
      filters: external_exports.union([comparisonFilterSchema, compoundFilterSchema]).optional()
    })
  )
);
var fileSearchOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      queries: external_exports.array(external_exports.string()),
      results: external_exports.array(
        external_exports.object({
          attributes: external_exports.record(external_exports.string(), external_exports.unknown()),
          fileId: external_exports.string(),
          filename: external_exports.string(),
          score: external_exports.number(),
          text: external_exports.string()
        })
      ).nullable()
    })
  )
);
var fileSearch = createProviderToolFactoryWithOutputSchema({
  id: "openai.file_search",
  inputSchema: external_exports.object({}),
  outputSchema: fileSearchOutputSchema
});
var imageGenerationArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      background: external_exports.enum(["auto", "opaque", "transparent"]).optional(),
      inputFidelity: external_exports.enum(["low", "high"]).optional(),
      inputImageMask: external_exports.object({
        fileId: external_exports.string().optional(),
        imageUrl: external_exports.string().optional()
      }).optional(),
      model: external_exports.string().optional(),
      moderation: external_exports.enum(["auto"]).optional(),
      outputCompression: external_exports.number().int().min(0).max(100).optional(),
      outputFormat: external_exports.enum(["png", "jpeg", "webp"]).optional(),
      partialImages: external_exports.number().int().min(0).max(3).optional(),
      quality: external_exports.enum(["auto", "low", "medium", "high"]).optional(),
      size: external_exports.enum(["1024x1024", "1024x1536", "1536x1024", "auto"]).optional()
    }).strict()
  )
);
var imageGenerationInputSchema = lazySchema(() => zodSchema(external_exports.object({})));
var imageGenerationOutputSchema = lazySchema(
  () => zodSchema(external_exports.object({ result: external_exports.string() }))
);
var imageGenerationToolFactory = createProviderToolFactoryWithOutputSchema({
  id: "openai.image_generation",
  inputSchema: imageGenerationInputSchema,
  outputSchema: imageGenerationOutputSchema
});
var imageGeneration = /* @__PURE__ */ __name((args = {}) => {
  return imageGenerationToolFactory(args);
}, "imageGeneration");
var localShellInputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      action: external_exports.object({
        type: external_exports.literal("exec"),
        command: external_exports.array(external_exports.string()),
        timeoutMs: external_exports.number().optional(),
        user: external_exports.string().optional(),
        workingDirectory: external_exports.string().optional(),
        env: external_exports.record(external_exports.string(), external_exports.string()).optional()
      })
    })
  )
);
var localShellOutputSchema = lazySchema(
  () => zodSchema(external_exports.object({ output: external_exports.string() }))
);
var localShell = createProviderToolFactoryWithOutputSchema({
  id: "openai.local_shell",
  inputSchema: localShellInputSchema,
  outputSchema: localShellOutputSchema
});
var shellInputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      action: external_exports.object({
        commands: external_exports.array(external_exports.string()),
        timeoutMs: external_exports.number().optional(),
        maxOutputLength: external_exports.number().optional()
      })
    })
  )
);
var shellOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      output: external_exports.array(
        external_exports.object({
          stdout: external_exports.string(),
          stderr: external_exports.string(),
          outcome: external_exports.discriminatedUnion("type", [
            external_exports.object({ type: external_exports.literal("timeout") }),
            external_exports.object({ type: external_exports.literal("exit"), exitCode: external_exports.number() })
          ])
        })
      )
    })
  )
);
var shellSkillsSchema = external_exports.array(
  external_exports.discriminatedUnion("type", [
    external_exports.object({
      type: external_exports.literal("skillReference"),
      skillId: external_exports.string(),
      version: external_exports.string().optional()
    }),
    external_exports.object({
      type: external_exports.literal("inline"),
      name: external_exports.string(),
      description: external_exports.string(),
      source: external_exports.object({
        type: external_exports.literal("base64"),
        mediaType: external_exports.literal("application/zip"),
        data: external_exports.string()
      })
    })
  ])
).optional();
var shellArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      environment: external_exports.union([
        external_exports.object({
          type: external_exports.literal("containerAuto"),
          fileIds: external_exports.array(external_exports.string()).optional(),
          memoryLimit: external_exports.enum(["1g", "4g", "16g", "64g"]).optional(),
          networkPolicy: external_exports.discriminatedUnion("type", [
            external_exports.object({ type: external_exports.literal("disabled") }),
            external_exports.object({
              type: external_exports.literal("allowlist"),
              allowedDomains: external_exports.array(external_exports.string()),
              domainSecrets: external_exports.array(
                external_exports.object({
                  domain: external_exports.string(),
                  name: external_exports.string(),
                  value: external_exports.string()
                })
              ).optional()
            })
          ]).optional(),
          skills: shellSkillsSchema
        }),
        external_exports.object({
          type: external_exports.literal("containerReference"),
          containerId: external_exports.string()
        }),
        external_exports.object({
          type: external_exports.literal("local").optional(),
          skills: external_exports.array(
            external_exports.object({
              name: external_exports.string(),
              description: external_exports.string(),
              path: external_exports.string()
            })
          ).optional()
        })
      ]).optional()
    })
  )
);
var shell = createProviderToolFactoryWithOutputSchema({
  id: "openai.shell",
  inputSchema: shellInputSchema,
  outputSchema: shellOutputSchema
});
var toolSearchArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      execution: external_exports.enum(["server", "client"]).optional(),
      description: external_exports.string().optional(),
      parameters: external_exports.record(external_exports.string(), external_exports.unknown()).optional()
    })
  )
);
var toolSearchInputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      arguments: external_exports.unknown().optional(),
      call_id: external_exports.string().nullish()
    })
  )
);
var toolSearchOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      tools: external_exports.array(external_exports.record(external_exports.string(), external_exports.unknown()))
    })
  )
);
var toolSearchToolFactory = createProviderToolFactoryWithOutputSchema({
  id: "openai.tool_search",
  inputSchema: toolSearchInputSchema,
  outputSchema: toolSearchOutputSchema
});
var toolSearch = /* @__PURE__ */ __name((args = {}) => toolSearchToolFactory(args), "toolSearch");
var webSearchArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      externalWebAccess: external_exports.boolean().optional(),
      filters: external_exports.object({ allowedDomains: external_exports.array(external_exports.string()).optional() }).optional(),
      searchContextSize: external_exports.enum(["low", "medium", "high"]).optional(),
      userLocation: external_exports.object({
        type: external_exports.literal("approximate"),
        country: external_exports.string().optional(),
        city: external_exports.string().optional(),
        region: external_exports.string().optional(),
        timezone: external_exports.string().optional()
      }).optional()
    })
  )
);
var webSearchInputSchema = lazySchema(() => zodSchema(external_exports.object({})));
var webSearchOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      action: external_exports.discriminatedUnion("type", [
        external_exports.object({
          type: external_exports.literal("search"),
          query: external_exports.string().optional()
        }),
        external_exports.object({
          type: external_exports.literal("openPage"),
          url: external_exports.string().nullish()
        }),
        external_exports.object({
          type: external_exports.literal("findInPage"),
          url: external_exports.string().nullish(),
          pattern: external_exports.string().nullish()
        })
      ]).optional(),
      sources: external_exports.array(
        external_exports.discriminatedUnion("type", [
          external_exports.object({ type: external_exports.literal("url"), url: external_exports.string() }),
          external_exports.object({ type: external_exports.literal("api"), name: external_exports.string() })
        ])
      ).optional()
    })
  )
);
var webSearchToolFactory = createProviderToolFactoryWithOutputSchema({
  id: "openai.web_search",
  inputSchema: webSearchInputSchema,
  outputSchema: webSearchOutputSchema
});
var webSearch = /* @__PURE__ */ __name((args = {}) => webSearchToolFactory(args), "webSearch");
var webSearchPreviewArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      searchContextSize: external_exports.enum(["low", "medium", "high"]).optional(),
      userLocation: external_exports.object({
        type: external_exports.literal("approximate"),
        country: external_exports.string().optional(),
        city: external_exports.string().optional(),
        region: external_exports.string().optional(),
        timezone: external_exports.string().optional()
      }).optional()
    })
  )
);
var webSearchPreviewInputSchema = lazySchema(
  () => zodSchema(external_exports.object({}))
);
var webSearchPreviewOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      action: external_exports.discriminatedUnion("type", [
        external_exports.object({
          type: external_exports.literal("search"),
          query: external_exports.string().optional()
        }),
        external_exports.object({
          type: external_exports.literal("openPage"),
          url: external_exports.string().nullish()
        }),
        external_exports.object({
          type: external_exports.literal("findInPage"),
          url: external_exports.string().nullish(),
          pattern: external_exports.string().nullish()
        })
      ]).optional()
    })
  )
);
var webSearchPreview = createProviderToolFactoryWithOutputSchema({
  id: "openai.web_search_preview",
  inputSchema: webSearchPreviewInputSchema,
  outputSchema: webSearchPreviewOutputSchema
});
var jsonValueSchema = external_exports.lazy(
  () => external_exports.union([
    external_exports.string(),
    external_exports.number(),
    external_exports.boolean(),
    external_exports.null(),
    external_exports.array(jsonValueSchema),
    external_exports.record(external_exports.string(), jsonValueSchema)
  ])
);
var mcpArgsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      serverLabel: external_exports.string(),
      allowedTools: external_exports.union([
        external_exports.array(external_exports.string()),
        external_exports.object({
          readOnly: external_exports.boolean().optional(),
          toolNames: external_exports.array(external_exports.string()).optional()
        })
      ]).optional(),
      authorization: external_exports.string().optional(),
      connectorId: external_exports.string().optional(),
      headers: external_exports.record(external_exports.string(), external_exports.string()).optional(),
      requireApproval: external_exports.union([
        external_exports.enum(["always", "never"]),
        external_exports.object({
          never: external_exports.object({
            toolNames: external_exports.array(external_exports.string()).optional()
          }).optional()
        })
      ]).optional(),
      serverDescription: external_exports.string().optional(),
      serverUrl: external_exports.string().optional()
    }).refine(
      (v) => v.serverUrl != null || v.connectorId != null,
      "One of serverUrl or connectorId must be provided."
    )
  )
);
var mcpInputSchema = lazySchema(() => zodSchema(external_exports.object({})));
var mcpOutputSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      type: external_exports.literal("call"),
      serverLabel: external_exports.string(),
      name: external_exports.string(),
      arguments: external_exports.string(),
      output: external_exports.string().nullish(),
      error: external_exports.union([external_exports.string(), jsonValueSchema]).optional()
    })
  )
);
var mcpToolFactory = createProviderToolFactoryWithOutputSchema({
  id: "openai.mcp",
  inputSchema: mcpInputSchema,
  outputSchema: mcpOutputSchema
});
var mcp = /* @__PURE__ */ __name((args) => mcpToolFactory(args), "mcp");
var openaiTools = {
  /**
   * The apply_patch tool lets GPT-5.1 create, update, and delete files in your
   * codebase using structured diffs. Instead of just suggesting edits, the model
   * emits patch operations that your application applies and then reports back on,
   * enabling iterative, multi-step code editing workflows.
   *
   */
  applyPatch,
  /**
   * Custom tools let callers constrain model output to a grammar (regex or
   * Lark syntax). The model returns a `custom_tool_call` output item whose
   * `input` field is a string matching the specified grammar.
   *
   * @param name - The name of the custom tool.
   * @param description - An optional description of the tool.
   * @param format - The output format constraint (grammar type, syntax, and definition).
   */
  customTool,
  /**
   * The Code Interpreter tool allows models to write and run Python code in a
   * sandboxed environment to solve complex problems in domains like data analysis,
   * coding, and math.
   *
   * @param container - The container to use for the code interpreter.
   */
  codeInterpreter,
  /**
   * File search is a tool available in the Responses API. It enables models to
   * retrieve information in a knowledge base of previously uploaded files through
   * semantic and keyword search.
   *
   * @param vectorStoreIds - The vector store IDs to use for the file search.
   * @param maxNumResults - The maximum number of results to return.
   * @param ranking - The ranking options to use for the file search.
   * @param filters - The filters to use for the file search.
   */
  fileSearch,
  /**
   * The image generation tool allows you to generate images using a text prompt,
   * and optionally image inputs. It leverages the GPT Image model,
   * and automatically optimizes text inputs for improved performance.
   *
   * @param background - Background type for the generated image. One of 'auto', 'opaque', or 'transparent'.
   * @param inputFidelity - Input fidelity for the generated image. One of 'low' or 'high'.
   * @param inputImageMask - Optional mask for inpainting. Contains fileId and/or imageUrl.
   * @param model - The image generation model to use. Default: gpt-image-1.
   * @param moderation - Moderation level for the generated image. Default: 'auto'.
   * @param outputCompression - Compression level for the output image (0-100).
   * @param outputFormat - The output format of the generated image. One of 'png', 'jpeg', or 'webp'.
   * @param partialImages - Number of partial images to generate in streaming mode (0-3).
   * @param quality - The quality of the generated image. One of 'auto', 'low', 'medium', or 'high'.
   * @param size - The size of the generated image. One of 'auto', '1024x1024', '1024x1536', or '1536x1024'.
   */
  imageGeneration,
  /**
   * Local shell is a tool that allows agents to run shell commands locally
   * on a machine you or the user provides.
   *
   * Supported models: `gpt-5-codex`
   */
  localShell,
  /**
   * The shell tool allows the model to interact with your local computer through
   * a controlled command-line interface. The model proposes shell commands; your
   * integration executes them and returns the outputs.
   *
   * Available through the Responses API for use with GPT-5.1.
   *
   * WARNING: Running arbitrary shell commands can be dangerous. Always sandbox
   * execution or add strict allow-/deny-lists before forwarding a command to
   * the system shell.
   */
  shell,
  /**
   * Web search allows models to access up-to-date information from the internet
   * and provide answers with sourced citations.
   *
   * @param searchContextSize - The search context size to use for the web search.
   * @param userLocation - The user location to use for the web search.
   */
  webSearchPreview,
  /**
   * Web search allows models to access up-to-date information from the internet
   * and provide answers with sourced citations.
   *
   * @param filters - The filters to use for the web search.
   * @param searchContextSize - The search context size to use for the web search.
   * @param userLocation - The user location to use for the web search.
   */
  webSearch,
  /**
   * MCP (Model Context Protocol) allows models to call tools exposed by
   * remote MCP servers or service connectors.
   *
   * @param serverLabel - Label to identify the MCP server.
   * @param allowedTools - Allowed tool names or filter object.
   * @param authorization - OAuth access token for the MCP server/connector.
   * @param connectorId - Identifier for a service connector.
   * @param headers - Optional headers to include in MCP requests.
   * // param requireApproval - Approval policy ('always'|'never'|filter object). (Removed - always 'never')
   * @param serverDescription - Optional description of the server.
   * @param serverUrl - URL for the MCP server.
   */
  mcp,
  /**
   * Tool search allows the model to dynamically search for and load deferred
   * tools into the model's context as needed. This helps reduce overall token
   * usage, cost, and latency by only loading tools when the model needs them.
   *
   * To use tool search, mark functions or namespaces with `defer_loading: true`
   * in the tools array. The model will use tool search to load these tools
   * when it determines they are needed.
   */
  toolSearch
};
function convertOpenAIResponsesUsage(usage) {
  var _a, _b, _c, _d;
  if (usage == null) {
    return {
      inputTokens: {
        total: void 0,
        noCache: void 0,
        cacheRead: void 0,
        cacheWrite: void 0
      },
      outputTokens: {
        total: void 0,
        text: void 0,
        reasoning: void 0
      },
      raw: void 0
    };
  }
  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  const cachedTokens = (_b = (_a = usage.input_tokens_details) == null ? void 0 : _a.cached_tokens) != null ? _b : 0;
  const reasoningTokens = (_d = (_c = usage.output_tokens_details) == null ? void 0 : _c.reasoning_tokens) != null ? _d : 0;
  return {
    inputTokens: {
      total: inputTokens,
      noCache: inputTokens - cachedTokens,
      cacheRead: cachedTokens,
      cacheWrite: void 0
    },
    outputTokens: {
      total: outputTokens,
      text: outputTokens - reasoningTokens,
      reasoning: reasoningTokens
    },
    raw: usage
  };
}
__name(convertOpenAIResponsesUsage, "convertOpenAIResponsesUsage");
function serializeToolCallArguments2(input) {
  return JSON.stringify(input === void 0 ? {} : input);
}
__name(serializeToolCallArguments2, "serializeToolCallArguments2");
function isFileId(data, prefixes) {
  if (!prefixes) return false;
  return prefixes.some((prefix) => data.startsWith(prefix));
}
__name(isFileId, "isFileId");
async function convertToOpenAIResponsesInput({
  prompt,
  toolNameMapping,
  systemMessageMode,
  providerOptionsName,
  fileIdPrefixes,
  store,
  hasConversation = false,
  hasLocalShellTool = false,
  hasShellTool = false,
  hasApplyPatchTool = false,
  customProviderToolNames
}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
  let input = [];
  const warnings = [];
  const processedApprovalIds = /* @__PURE__ */ new Set();
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        switch (systemMessageMode) {
          case "system": {
            input.push({ role: "system", content });
            break;
          }
          case "developer": {
            input.push({ role: "developer", content });
            break;
          }
          case "remove": {
            warnings.push({
              type: "other",
              message: "system messages are removed for this model"
            });
            break;
          }
          default: {
            const _exhaustiveCheck = systemMessageMode;
            throw new Error(
              `Unsupported system message mode: ${_exhaustiveCheck}`
            );
          }
        }
        break;
      }
      case "user": {
        input.push({
          role: "user",
          content: content.map((part, index) => {
            var _a2, _b2, _c2;
            switch (part.type) {
              case "text": {
                return { type: "input_text", text: part.text };
              }
              case "file": {
                if (part.mediaType.startsWith("image/")) {
                  const mediaType = part.mediaType === "image/*" ? "image/jpeg" : part.mediaType;
                  return {
                    type: "input_image",
                    ...part.data instanceof URL ? { image_url: part.data.toString() } : typeof part.data === "string" && isFileId(part.data, fileIdPrefixes) ? { file_id: part.data } : {
                      image_url: `data:${mediaType};base64,${convertToBase64(part.data)}`
                    },
                    detail: (_b2 = (_a2 = part.providerOptions) == null ? void 0 : _a2[providerOptionsName]) == null ? void 0 : _b2.imageDetail
                  };
                } else if (part.mediaType === "application/pdf") {
                  if (part.data instanceof URL) {
                    return {
                      type: "input_file",
                      file_url: part.data.toString()
                    };
                  }
                  return {
                    type: "input_file",
                    ...typeof part.data === "string" && isFileId(part.data, fileIdPrefixes) ? { file_id: part.data } : {
                      filename: (_c2 = part.filename) != null ? _c2 : `part-${index}.pdf`,
                      file_data: `data:application/pdf;base64,${convertToBase64(part.data)}`
                    }
                  };
                } else {
                  throw new UnsupportedFunctionalityError({
                    functionality: `file part media type ${part.mediaType}`
                  });
                }
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        const reasoningMessages = {};
        for (const part of content) {
          switch (part.type) {
            case "text": {
              const providerOpts = (_a = part.providerOptions) == null ? void 0 : _a[providerOptionsName];
              const id = providerOpts == null ? void 0 : providerOpts.itemId;
              const phase = providerOpts == null ? void 0 : providerOpts.phase;
              if (hasConversation && id != null) {
                break;
              }
              if (store && id != null) {
                input.push({ type: "item_reference", id });
                break;
              }
              input.push({
                role: "assistant",
                content: [{ type: "output_text", text: part.text }],
                id,
                ...phase != null && { phase }
              });
              break;
            }
            case "tool-call": {
              const id = (_f = (_c = (_b = part.providerOptions) == null ? void 0 : _b[providerOptionsName]) == null ? void 0 : _c.itemId) != null ? _f : (_e = (_d = part.providerMetadata) == null ? void 0 : _d[providerOptionsName]) == null ? void 0 : _e.itemId;
              if (hasConversation && id != null) {
                break;
              }
              const resolvedToolName = toolNameMapping.toProviderToolName(
                part.toolName
              );
              if (resolvedToolName === "tool_search") {
                if (store && id != null) {
                  input.push({ type: "item_reference", id });
                  break;
                }
                const parsedInput = typeof part.input === "string" ? await parseJSON({
                  text: part.input,
                  schema: toolSearchInputSchema
                }) : await validateTypes({
                  value: part.input,
                  schema: toolSearchInputSchema
                });
                const execution = parsedInput.call_id != null ? "client" : "server";
                input.push({
                  type: "tool_search_call",
                  id: id != null ? id : part.toolCallId,
                  execution,
                  call_id: (_g = parsedInput.call_id) != null ? _g : null,
                  status: "completed",
                  arguments: parsedInput.arguments
                });
                break;
              }
              if (part.providerExecuted) {
                if (store && id != null) {
                  input.push({ type: "item_reference", id });
                }
                break;
              }
              if (store && id != null) {
                input.push({ type: "item_reference", id });
                break;
              }
              if (hasLocalShellTool && resolvedToolName === "local_shell") {
                const parsedInput = await validateTypes({
                  value: part.input,
                  schema: localShellInputSchema
                });
                input.push({
                  type: "local_shell_call",
                  call_id: part.toolCallId,
                  id,
                  action: {
                    type: "exec",
                    command: parsedInput.action.command,
                    timeout_ms: parsedInput.action.timeoutMs,
                    user: parsedInput.action.user,
                    working_directory: parsedInput.action.workingDirectory,
                    env: parsedInput.action.env
                  }
                });
                break;
              }
              if (hasShellTool && resolvedToolName === "shell") {
                const parsedInput = await validateTypes({
                  value: part.input,
                  schema: shellInputSchema
                });
                input.push({
                  type: "shell_call",
                  call_id: part.toolCallId,
                  id,
                  status: "completed",
                  action: {
                    commands: parsedInput.action.commands,
                    timeout_ms: parsedInput.action.timeoutMs,
                    max_output_length: parsedInput.action.maxOutputLength
                  }
                });
                break;
              }
              if (hasApplyPatchTool && resolvedToolName === "apply_patch") {
                const parsedInput = await validateTypes({
                  value: part.input,
                  schema: applyPatchInputSchema
                });
                input.push({
                  type: "apply_patch_call",
                  call_id: parsedInput.callId,
                  id,
                  status: "completed",
                  operation: parsedInput.operation
                });
                break;
              }
              if (customProviderToolNames == null ? void 0 : customProviderToolNames.has(resolvedToolName)) {
                input.push({
                  type: "custom_tool_call",
                  call_id: part.toolCallId,
                  name: resolvedToolName,
                  input: typeof part.input === "string" ? part.input : JSON.stringify(part.input),
                  id
                });
                break;
              }
              input.push({
                type: "function_call",
                call_id: part.toolCallId,
                name: resolvedToolName,
                arguments: serializeToolCallArguments2(part.input),
                id
              });
              break;
            }
            // assistant tool result parts are from provider-executed tools:
            case "tool-result": {
              if (part.output.type === "execution-denied" || part.output.type === "json" && typeof part.output.value === "object" && part.output.value != null && "type" in part.output.value && part.output.value.type === "execution-denied") {
                break;
              }
              if (hasConversation) {
                break;
              }
              const resolvedResultToolName = toolNameMapping.toProviderToolName(
                part.toolName
              );
              if (resolvedResultToolName === "tool_search") {
                const itemId = (_j = (_i = (_h = part.providerOptions) == null ? void 0 : _h[providerOptionsName]) == null ? void 0 : _i.itemId) != null ? _j : part.toolCallId;
                if (store) {
                  input.push({ type: "item_reference", id: itemId });
                } else if (part.output.type === "json") {
                  const parsedOutput = await validateTypes({
                    value: part.output.value,
                    schema: toolSearchOutputSchema
                  });
                  input.push({
                    type: "tool_search_output",
                    id: itemId,
                    execution: "server",
                    call_id: null,
                    status: "completed",
                    tools: parsedOutput.tools
                  });
                }
                break;
              }
              if (hasShellTool && resolvedResultToolName === "shell") {
                if (part.output.type === "json") {
                  const parsedOutput = await validateTypes({
                    value: part.output.value,
                    schema: shellOutputSchema
                  });
                  input.push({
                    type: "shell_call_output",
                    call_id: part.toolCallId,
                    output: parsedOutput.output.map((item) => ({
                      stdout: item.stdout,
                      stderr: item.stderr,
                      outcome: item.outcome.type === "timeout" ? { type: "timeout" } : {
                        type: "exit",
                        exit_code: item.outcome.exitCode
                      }
                    }))
                  });
                }
                break;
              }
              if (store) {
                const itemId = (_m = (_l = (_k = part.providerOptions) == null ? void 0 : _k[providerOptionsName]) == null ? void 0 : _l.itemId) != null ? _m : part.toolCallId;
                input.push({ type: "item_reference", id: itemId });
              } else {
                warnings.push({
                  type: "other",
                  message: `Results for OpenAI tool ${part.toolName} are not sent to the API when store is false`
                });
              }
              break;
            }
            case "reasoning": {
              const providerOptions = await parseProviderOptions({
                provider: providerOptionsName,
                providerOptions: part.providerOptions,
                schema: openaiResponsesReasoningProviderOptionsSchema
              });
              const reasoningId = providerOptions == null ? void 0 : providerOptions.itemId;
              if (hasConversation && reasoningId != null) {
                break;
              }
              if (reasoningId != null) {
                const reasoningMessage = reasoningMessages[reasoningId];
                if (store) {
                  if (reasoningMessage === void 0) {
                    input.push({ type: "item_reference", id: reasoningId });
                    reasoningMessages[reasoningId] = {
                      type: "reasoning",
                      id: reasoningId,
                      summary: []
                    };
                  }
                } else {
                  const summaryParts = [];
                  if (part.text.length > 0) {
                    summaryParts.push({
                      type: "summary_text",
                      text: part.text
                    });
                  } else if (reasoningMessage !== void 0) {
                    warnings.push({
                      type: "other",
                      message: `Cannot append empty reasoning part to existing reasoning sequence. Skipping reasoning part: ${JSON.stringify(part)}.`
                    });
                  }
                  if (reasoningMessage === void 0) {
                    reasoningMessages[reasoningId] = {
                      type: "reasoning",
                      id: reasoningId,
                      encrypted_content: providerOptions == null ? void 0 : providerOptions.reasoningEncryptedContent,
                      summary: summaryParts
                    };
                    input.push(reasoningMessages[reasoningId]);
                  } else {
                    reasoningMessage.summary.push(...summaryParts);
                    if ((providerOptions == null ? void 0 : providerOptions.reasoningEncryptedContent) != null) {
                      reasoningMessage.encrypted_content = providerOptions.reasoningEncryptedContent;
                    }
                  }
                }
              } else {
                const encryptedContent = providerOptions == null ? void 0 : providerOptions.reasoningEncryptedContent;
                if (encryptedContent != null) {
                  const summaryParts = [];
                  if (part.text.length > 0) {
                    summaryParts.push({
                      type: "summary_text",
                      text: part.text
                    });
                  }
                  input.push({
                    type: "reasoning",
                    encrypted_content: encryptedContent,
                    summary: summaryParts
                  });
                } else {
                  warnings.push({
                    type: "other",
                    message: `Non-OpenAI reasoning parts are not supported. Skipping reasoning part: ${JSON.stringify(part)}.`
                  });
                }
              }
              break;
            }
          }
        }
        break;
      }
      case "tool": {
        for (const part of content) {
          if (part.type === "tool-approval-response") {
            const approvalResponse = part;
            if (processedApprovalIds.has(approvalResponse.approvalId)) {
              continue;
            }
            processedApprovalIds.add(approvalResponse.approvalId);
            if (store) {
              input.push({
                type: "item_reference",
                id: approvalResponse.approvalId
              });
            }
            input.push({
              type: "mcp_approval_response",
              approval_request_id: approvalResponse.approvalId,
              approve: approvalResponse.approved
            });
            continue;
          }
          const output = part.output;
          if (output.type === "execution-denied") {
            const approvalId = (_o = (_n = output.providerOptions) == null ? void 0 : _n.openai) == null ? void 0 : _o.approvalId;
            if (approvalId) {
              continue;
            }
          }
          const resolvedToolName = toolNameMapping.toProviderToolName(
            part.toolName
          );
          if (resolvedToolName === "tool_search" && output.type === "json") {
            const parsedOutput = await validateTypes({
              value: output.value,
              schema: toolSearchOutputSchema
            });
            input.push({
              type: "tool_search_output",
              execution: "client",
              call_id: part.toolCallId,
              status: "completed",
              tools: parsedOutput.tools
            });
            continue;
          }
          if (hasLocalShellTool && resolvedToolName === "local_shell" && output.type === "json") {
            const parsedOutput = await validateTypes({
              value: output.value,
              schema: localShellOutputSchema
            });
            input.push({
              type: "local_shell_call_output",
              call_id: part.toolCallId,
              output: parsedOutput.output
            });
            continue;
          }
          if (hasShellTool && resolvedToolName === "shell" && output.type === "json") {
            const parsedOutput = await validateTypes({
              value: output.value,
              schema: shellOutputSchema
            });
            input.push({
              type: "shell_call_output",
              call_id: part.toolCallId,
              output: parsedOutput.output.map((item) => ({
                stdout: item.stdout,
                stderr: item.stderr,
                outcome: item.outcome.type === "timeout" ? { type: "timeout" } : {
                  type: "exit",
                  exit_code: item.outcome.exitCode
                }
              }))
            });
            continue;
          }
          if (hasApplyPatchTool && part.toolName === "apply_patch" && output.type === "json") {
            const parsedOutput = await validateTypes({
              value: output.value,
              schema: applyPatchOutputSchema
            });
            input.push({
              type: "apply_patch_call_output",
              call_id: part.toolCallId,
              status: parsedOutput.status,
              output: parsedOutput.output
            });
            continue;
          }
          if (customProviderToolNames == null ? void 0 : customProviderToolNames.has(resolvedToolName)) {
            let outputValue;
            switch (output.type) {
              case "text":
              case "error-text":
                outputValue = output.value;
                break;
              case "execution-denied":
                outputValue = (_p = output.reason) != null ? _p : "Tool execution denied.";
                break;
              case "json":
              case "error-json":
                outputValue = JSON.stringify(output.value);
                break;
              case "content":
                outputValue = output.value.map((item) => {
                  var _a2;
                  switch (item.type) {
                    case "text":
                      return { type: "input_text", text: item.text };
                    case "image-data":
                      return {
                        type: "input_image",
                        image_url: `data:${item.mediaType};base64,${item.data}`
                      };
                    case "image-url":
                      return {
                        type: "input_image",
                        image_url: item.url
                      };
                    case "file-data":
                      return {
                        type: "input_file",
                        filename: (_a2 = item.filename) != null ? _a2 : "data",
                        file_data: `data:${item.mediaType};base64,${item.data}`
                      };
                    case "file-url":
                      return {
                        type: "input_file",
                        file_url: item.url
                      };
                    default:
                      warnings.push({
                        type: "other",
                        message: `unsupported custom tool content part type: ${item.type}`
                      });
                      return void 0;
                  }
                }).filter(isNonNullable);
                break;
              default:
                outputValue = "";
            }
            input.push({
              type: "custom_tool_call_output",
              call_id: part.toolCallId,
              output: outputValue
            });
            continue;
          }
          let contentValue;
          switch (output.type) {
            case "text":
            case "error-text":
              contentValue = output.value;
              break;
            case "execution-denied":
              contentValue = (_q = output.reason) != null ? _q : "Tool execution denied.";
              break;
            case "json":
            case "error-json":
              contentValue = JSON.stringify(output.value);
              break;
            case "content":
              contentValue = output.value.map((item) => {
                var _a2;
                switch (item.type) {
                  case "text": {
                    return { type: "input_text", text: item.text };
                  }
                  case "image-data": {
                    return {
                      type: "input_image",
                      image_url: `data:${item.mediaType};base64,${item.data}`
                    };
                  }
                  case "image-url": {
                    return {
                      type: "input_image",
                      image_url: item.url
                    };
                  }
                  case "file-data": {
                    return {
                      type: "input_file",
                      filename: (_a2 = item.filename) != null ? _a2 : "data",
                      file_data: `data:${item.mediaType};base64,${item.data}`
                    };
                  }
                  case "file-url": {
                    return {
                      type: "input_file",
                      file_url: item.url
                    };
                  }
                  default: {
                    warnings.push({
                      type: "other",
                      message: `unsupported tool content part type: ${item.type}`
                    });
                    return void 0;
                  }
                }
              }).filter(isNonNullable);
              break;
          }
          input.push({
            type: "function_call_output",
            call_id: part.toolCallId,
            output: contentValue
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  if (!store && input.some(
    (item) => "type" in item && item.type === "reasoning" && item.encrypted_content == null
  )) {
    warnings.push({
      type: "other",
      message: "Reasoning parts without encrypted content are not supported when store is false. Skipping reasoning parts."
    });
    input = input.filter(
      (item) => !("type" in item) || item.type !== "reasoning" || item.encrypted_content != null
    );
  }
  return { input, warnings };
}
__name(convertToOpenAIResponsesInput, "convertToOpenAIResponsesInput");
var openaiResponsesReasoningProviderOptionsSchema = external_exports.object({
  itemId: external_exports.string().nullish(),
  reasoningEncryptedContent: external_exports.string().nullish()
});
function mapOpenAIResponseFinishReason({
  finishReason,
  hasFunctionCall
}) {
  switch (finishReason) {
    case void 0:
    case null:
      return hasFunctionCall ? "tool-calls" : "stop";
    case "max_output_tokens":
      return "length";
    case "content_filter":
      return "content-filter";
    default:
      return hasFunctionCall ? "tool-calls" : "other";
  }
}
__name(mapOpenAIResponseFinishReason, "mapOpenAIResponseFinishReason");
var jsonValueSchema2 = external_exports.lazy(
  () => external_exports.union([
    external_exports.string(),
    external_exports.number(),
    external_exports.boolean(),
    external_exports.null(),
    external_exports.array(jsonValueSchema2),
    external_exports.record(external_exports.string(), jsonValueSchema2.optional())
  ])
);
var openaiResponsesChunkSchema = lazySchema(
  () => zodSchema(
    external_exports.union([
      external_exports.object({
        type: external_exports.literal("response.output_text.delta"),
        item_id: external_exports.string(),
        delta: external_exports.string(),
        logprobs: external_exports.array(
          external_exports.object({
            token: external_exports.string(),
            logprob: external_exports.number(),
            top_logprobs: external_exports.array(
              external_exports.object({
                token: external_exports.string(),
                logprob: external_exports.number()
              })
            )
          })
        ).nullish()
      }),
      external_exports.object({
        type: external_exports.enum(["response.completed", "response.incomplete"]),
        response: external_exports.object({
          incomplete_details: external_exports.object({ reason: external_exports.string() }).nullish(),
          usage: external_exports.object({
            input_tokens: external_exports.number(),
            input_tokens_details: external_exports.object({ cached_tokens: external_exports.number().nullish() }).nullish(),
            output_tokens: external_exports.number(),
            output_tokens_details: external_exports.object({ reasoning_tokens: external_exports.number().nullish() }).nullish()
          }),
          service_tier: external_exports.string().nullish()
        })
      }),
      external_exports.object({
        type: external_exports.literal("response.failed"),
        response: external_exports.object({
          error: external_exports.object({
            code: external_exports.string().nullish(),
            message: external_exports.string()
          }).nullish(),
          incomplete_details: external_exports.object({ reason: external_exports.string() }).nullish(),
          usage: external_exports.object({
            input_tokens: external_exports.number(),
            input_tokens_details: external_exports.object({ cached_tokens: external_exports.number().nullish() }).nullish(),
            output_tokens: external_exports.number(),
            output_tokens_details: external_exports.object({ reasoning_tokens: external_exports.number().nullish() }).nullish()
          }).nullish(),
          service_tier: external_exports.string().nullish()
        })
      }),
      external_exports.object({
        type: external_exports.literal("response.created"),
        response: external_exports.object({
          id: external_exports.string(),
          created_at: external_exports.number(),
          model: external_exports.string(),
          service_tier: external_exports.string().nullish()
        })
      }),
      external_exports.object({
        type: external_exports.literal("response.output_item.added"),
        output_index: external_exports.number(),
        item: external_exports.discriminatedUnion("type", [
          external_exports.object({
            type: external_exports.literal("message"),
            id: external_exports.string(),
            phase: external_exports.enum(["commentary", "final_answer"]).nullish()
          }),
          external_exports.object({
            type: external_exports.literal("reasoning"),
            id: external_exports.string(),
            encrypted_content: external_exports.string().nullish()
          }),
          external_exports.object({
            type: external_exports.literal("function_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            name: external_exports.string(),
            arguments: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("web_search_call"),
            id: external_exports.string(),
            status: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("computer_call"),
            id: external_exports.string(),
            status: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("file_search_call"),
            id: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("image_generation_call"),
            id: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("code_interpreter_call"),
            id: external_exports.string(),
            container_id: external_exports.string(),
            code: external_exports.string().nullable(),
            outputs: external_exports.array(
              external_exports.discriminatedUnion("type", [
                external_exports.object({ type: external_exports.literal("logs"), logs: external_exports.string() }),
                external_exports.object({ type: external_exports.literal("image"), url: external_exports.string() })
              ])
            ).nullable(),
            status: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_call"),
            id: external_exports.string(),
            status: external_exports.string(),
            approval_request_id: external_exports.string().nullish()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_list_tools"),
            id: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_approval_request"),
            id: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("apply_patch_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed"]),
            operation: external_exports.discriminatedUnion("type", [
              external_exports.object({
                type: external_exports.literal("create_file"),
                path: external_exports.string(),
                diff: external_exports.string()
              }),
              external_exports.object({
                type: external_exports.literal("delete_file"),
                path: external_exports.string()
              }),
              external_exports.object({
                type: external_exports.literal("update_file"),
                path: external_exports.string(),
                diff: external_exports.string()
              })
            ])
          }),
          external_exports.object({
            type: external_exports.literal("custom_tool_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            name: external_exports.string(),
            input: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("shell_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            action: external_exports.object({
              commands: external_exports.array(external_exports.string())
            })
          }),
          external_exports.object({
            type: external_exports.literal("shell_call_output"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            output: external_exports.array(
              external_exports.object({
                stdout: external_exports.string(),
                stderr: external_exports.string(),
                outcome: external_exports.discriminatedUnion("type", [
                  external_exports.object({ type: external_exports.literal("timeout") }),
                  external_exports.object({
                    type: external_exports.literal("exit"),
                    exit_code: external_exports.number()
                  })
                ])
              })
            )
          }),
          external_exports.object({
            type: external_exports.literal("tool_search_call"),
            id: external_exports.string(),
            execution: external_exports.enum(["server", "client"]),
            call_id: external_exports.string().nullable(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            arguments: external_exports.unknown()
          }),
          external_exports.object({
            type: external_exports.literal("tool_search_output"),
            id: external_exports.string(),
            execution: external_exports.enum(["server", "client"]),
            call_id: external_exports.string().nullable(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            tools: external_exports.array(external_exports.record(external_exports.string(), jsonValueSchema2.optional()))
          })
        ])
      }),
      external_exports.object({
        type: external_exports.literal("response.output_item.done"),
        output_index: external_exports.number(),
        item: external_exports.discriminatedUnion("type", [
          external_exports.object({
            type: external_exports.literal("message"),
            id: external_exports.string(),
            phase: external_exports.enum(["commentary", "final_answer"]).nullish()
          }),
          external_exports.object({
            type: external_exports.literal("reasoning"),
            id: external_exports.string(),
            encrypted_content: external_exports.string().nullish()
          }),
          external_exports.object({
            type: external_exports.literal("function_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            name: external_exports.string(),
            arguments: external_exports.string(),
            status: external_exports.literal("completed")
          }),
          external_exports.object({
            type: external_exports.literal("custom_tool_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            name: external_exports.string(),
            input: external_exports.string(),
            status: external_exports.literal("completed")
          }),
          external_exports.object({
            type: external_exports.literal("code_interpreter_call"),
            id: external_exports.string(),
            code: external_exports.string().nullable(),
            container_id: external_exports.string(),
            outputs: external_exports.array(
              external_exports.discriminatedUnion("type", [
                external_exports.object({ type: external_exports.literal("logs"), logs: external_exports.string() }),
                external_exports.object({ type: external_exports.literal("image"), url: external_exports.string() })
              ])
            ).nullable()
          }),
          external_exports.object({
            type: external_exports.literal("image_generation_call"),
            id: external_exports.string(),
            result: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("web_search_call"),
            id: external_exports.string(),
            status: external_exports.string(),
            action: external_exports.discriminatedUnion("type", [
              external_exports.object({
                type: external_exports.literal("search"),
                query: external_exports.string().nullish(),
                sources: external_exports.array(
                  external_exports.discriminatedUnion("type", [
                    external_exports.object({ type: external_exports.literal("url"), url: external_exports.string() }),
                    external_exports.object({ type: external_exports.literal("api"), name: external_exports.string() })
                  ])
                ).nullish()
              }),
              external_exports.object({
                type: external_exports.literal("open_page"),
                url: external_exports.string().nullish()
              }),
              external_exports.object({
                type: external_exports.literal("find_in_page"),
                url: external_exports.string().nullish(),
                pattern: external_exports.string().nullish()
              })
            ]).nullish()
          }),
          external_exports.object({
            type: external_exports.literal("file_search_call"),
            id: external_exports.string(),
            queries: external_exports.array(external_exports.string()),
            results: external_exports.array(
              external_exports.object({
                attributes: external_exports.record(
                  external_exports.string(),
                  external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean()])
                ),
                file_id: external_exports.string(),
                filename: external_exports.string(),
                score: external_exports.number(),
                text: external_exports.string()
              })
            ).nullish()
          }),
          external_exports.object({
            type: external_exports.literal("local_shell_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            action: external_exports.object({
              type: external_exports.literal("exec"),
              command: external_exports.array(external_exports.string()),
              timeout_ms: external_exports.number().optional(),
              user: external_exports.string().optional(),
              working_directory: external_exports.string().optional(),
              env: external_exports.record(external_exports.string(), external_exports.string()).optional()
            })
          }),
          external_exports.object({
            type: external_exports.literal("computer_call"),
            id: external_exports.string(),
            status: external_exports.literal("completed")
          }),
          external_exports.object({
            type: external_exports.literal("mcp_call"),
            id: external_exports.string(),
            status: external_exports.string(),
            arguments: external_exports.string(),
            name: external_exports.string(),
            server_label: external_exports.string(),
            output: external_exports.string().nullish(),
            error: external_exports.union([
              external_exports.string(),
              external_exports.object({
                type: external_exports.string().optional(),
                code: external_exports.union([external_exports.number(), external_exports.string()]).optional(),
                message: external_exports.string().optional()
              }).loose()
            ]).nullish(),
            approval_request_id: external_exports.string().nullish()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_list_tools"),
            id: external_exports.string(),
            server_label: external_exports.string(),
            tools: external_exports.array(
              external_exports.object({
                name: external_exports.string(),
                description: external_exports.string().optional(),
                input_schema: external_exports.any(),
                annotations: external_exports.record(external_exports.string(), external_exports.unknown()).optional()
              })
            ),
            error: external_exports.union([
              external_exports.string(),
              external_exports.object({
                type: external_exports.string().optional(),
                code: external_exports.union([external_exports.number(), external_exports.string()]).optional(),
                message: external_exports.string().optional()
              }).loose()
            ]).optional()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_approval_request"),
            id: external_exports.string(),
            server_label: external_exports.string(),
            name: external_exports.string(),
            arguments: external_exports.string(),
            approval_request_id: external_exports.string().optional()
          }),
          external_exports.object({
            type: external_exports.literal("apply_patch_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed"]),
            operation: external_exports.discriminatedUnion("type", [
              external_exports.object({
                type: external_exports.literal("create_file"),
                path: external_exports.string(),
                diff: external_exports.string()
              }),
              external_exports.object({
                type: external_exports.literal("delete_file"),
                path: external_exports.string()
              }),
              external_exports.object({
                type: external_exports.literal("update_file"),
                path: external_exports.string(),
                diff: external_exports.string()
              })
            ])
          }),
          external_exports.object({
            type: external_exports.literal("shell_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            action: external_exports.object({
              commands: external_exports.array(external_exports.string())
            })
          }),
          external_exports.object({
            type: external_exports.literal("shell_call_output"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            output: external_exports.array(
              external_exports.object({
                stdout: external_exports.string(),
                stderr: external_exports.string(),
                outcome: external_exports.discriminatedUnion("type", [
                  external_exports.object({ type: external_exports.literal("timeout") }),
                  external_exports.object({
                    type: external_exports.literal("exit"),
                    exit_code: external_exports.number()
                  })
                ])
              })
            )
          }),
          external_exports.object({
            type: external_exports.literal("tool_search_call"),
            id: external_exports.string(),
            execution: external_exports.enum(["server", "client"]),
            call_id: external_exports.string().nullable(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            arguments: external_exports.unknown()
          }),
          external_exports.object({
            type: external_exports.literal("tool_search_output"),
            id: external_exports.string(),
            execution: external_exports.enum(["server", "client"]),
            call_id: external_exports.string().nullable(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            tools: external_exports.array(external_exports.record(external_exports.string(), jsonValueSchema2.optional()))
          })
        ])
      }),
      external_exports.object({
        type: external_exports.literal("response.function_call_arguments.delta"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        delta: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("response.custom_tool_call_input.delta"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        delta: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("response.image_generation_call.partial_image"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        partial_image_b64: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("response.code_interpreter_call_code.delta"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        delta: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("response.code_interpreter_call_code.done"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        code: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("response.output_text.annotation.added"),
        annotation: external_exports.discriminatedUnion("type", [
          external_exports.object({
            type: external_exports.literal("url_citation"),
            start_index: external_exports.number(),
            end_index: external_exports.number(),
            url: external_exports.string(),
            title: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("file_citation"),
            file_id: external_exports.string(),
            filename: external_exports.string(),
            index: external_exports.number()
          }),
          external_exports.object({
            type: external_exports.literal("container_file_citation"),
            container_id: external_exports.string(),
            file_id: external_exports.string(),
            filename: external_exports.string(),
            start_index: external_exports.number(),
            end_index: external_exports.number()
          }),
          external_exports.object({
            type: external_exports.literal("file_path"),
            file_id: external_exports.string(),
            index: external_exports.number()
          })
        ])
      }),
      external_exports.object({
        type: external_exports.literal("response.reasoning_summary_part.added"),
        item_id: external_exports.string(),
        summary_index: external_exports.number()
      }),
      external_exports.object({
        type: external_exports.literal("response.reasoning_summary_text.delta"),
        item_id: external_exports.string(),
        summary_index: external_exports.number(),
        delta: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("response.reasoning_summary_part.done"),
        item_id: external_exports.string(),
        summary_index: external_exports.number()
      }),
      external_exports.object({
        type: external_exports.literal("response.apply_patch_call_operation_diff.delta"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        delta: external_exports.string(),
        obfuscation: external_exports.string().nullish()
      }),
      external_exports.object({
        type: external_exports.literal("response.apply_patch_call_operation_diff.done"),
        item_id: external_exports.string(),
        output_index: external_exports.number(),
        diff: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("error"),
        sequence_number: external_exports.number(),
        error: external_exports.object({
          type: external_exports.string(),
          code: external_exports.string(),
          message: external_exports.string(),
          param: external_exports.string().nullish()
        })
      }),
      external_exports.object({ type: external_exports.string() }).loose().transform((value) => ({
        type: "unknown_chunk",
        message: value.type
      }))
      // fallback for unknown chunks
    ])
  )
);
var openaiResponsesResponseSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      id: external_exports.string().optional(),
      created_at: external_exports.number().optional(),
      error: external_exports.object({
        message: external_exports.string(),
        type: external_exports.string(),
        param: external_exports.string().nullish(),
        code: external_exports.string()
      }).nullish(),
      model: external_exports.string().optional(),
      output: external_exports.array(
        external_exports.discriminatedUnion("type", [
          external_exports.object({
            type: external_exports.literal("message"),
            role: external_exports.literal("assistant"),
            id: external_exports.string(),
            phase: external_exports.enum(["commentary", "final_answer"]).nullish(),
            content: external_exports.array(
              external_exports.object({
                type: external_exports.literal("output_text"),
                text: external_exports.string(),
                logprobs: external_exports.array(
                  external_exports.object({
                    token: external_exports.string(),
                    logprob: external_exports.number(),
                    top_logprobs: external_exports.array(
                      external_exports.object({
                        token: external_exports.string(),
                        logprob: external_exports.number()
                      })
                    )
                  })
                ).nullish(),
                annotations: external_exports.array(
                  external_exports.discriminatedUnion("type", [
                    external_exports.object({
                      type: external_exports.literal("url_citation"),
                      start_index: external_exports.number(),
                      end_index: external_exports.number(),
                      url: external_exports.string(),
                      title: external_exports.string()
                    }),
                    external_exports.object({
                      type: external_exports.literal("file_citation"),
                      file_id: external_exports.string(),
                      filename: external_exports.string(),
                      index: external_exports.number()
                    }),
                    external_exports.object({
                      type: external_exports.literal("container_file_citation"),
                      container_id: external_exports.string(),
                      file_id: external_exports.string(),
                      filename: external_exports.string(),
                      start_index: external_exports.number(),
                      end_index: external_exports.number()
                    }),
                    external_exports.object({
                      type: external_exports.literal("file_path"),
                      file_id: external_exports.string(),
                      index: external_exports.number()
                    })
                  ])
                )
              })
            )
          }),
          external_exports.object({
            type: external_exports.literal("web_search_call"),
            id: external_exports.string(),
            status: external_exports.string(),
            action: external_exports.discriminatedUnion("type", [
              external_exports.object({
                type: external_exports.literal("search"),
                query: external_exports.string().nullish(),
                sources: external_exports.array(
                  external_exports.discriminatedUnion("type", [
                    external_exports.object({ type: external_exports.literal("url"), url: external_exports.string() }),
                    external_exports.object({
                      type: external_exports.literal("api"),
                      name: external_exports.string()
                    })
                  ])
                ).nullish()
              }),
              external_exports.object({
                type: external_exports.literal("open_page"),
                url: external_exports.string().nullish()
              }),
              external_exports.object({
                type: external_exports.literal("find_in_page"),
                url: external_exports.string().nullish(),
                pattern: external_exports.string().nullish()
              })
            ]).nullish()
          }),
          external_exports.object({
            type: external_exports.literal("file_search_call"),
            id: external_exports.string(),
            queries: external_exports.array(external_exports.string()),
            results: external_exports.array(
              external_exports.object({
                attributes: external_exports.record(
                  external_exports.string(),
                  external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean()])
                ),
                file_id: external_exports.string(),
                filename: external_exports.string(),
                score: external_exports.number(),
                text: external_exports.string()
              })
            ).nullish()
          }),
          external_exports.object({
            type: external_exports.literal("code_interpreter_call"),
            id: external_exports.string(),
            code: external_exports.string().nullable(),
            container_id: external_exports.string(),
            outputs: external_exports.array(
              external_exports.discriminatedUnion("type", [
                external_exports.object({ type: external_exports.literal("logs"), logs: external_exports.string() }),
                external_exports.object({ type: external_exports.literal("image"), url: external_exports.string() })
              ])
            ).nullable()
          }),
          external_exports.object({
            type: external_exports.literal("image_generation_call"),
            id: external_exports.string(),
            result: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("local_shell_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            action: external_exports.object({
              type: external_exports.literal("exec"),
              command: external_exports.array(external_exports.string()),
              timeout_ms: external_exports.number().optional(),
              user: external_exports.string().optional(),
              working_directory: external_exports.string().optional(),
              env: external_exports.record(external_exports.string(), external_exports.string()).optional()
            })
          }),
          external_exports.object({
            type: external_exports.literal("function_call"),
            call_id: external_exports.string(),
            name: external_exports.string(),
            arguments: external_exports.string(),
            id: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("custom_tool_call"),
            call_id: external_exports.string(),
            name: external_exports.string(),
            input: external_exports.string(),
            id: external_exports.string()
          }),
          external_exports.object({
            type: external_exports.literal("computer_call"),
            id: external_exports.string(),
            status: external_exports.string().optional()
          }),
          external_exports.object({
            type: external_exports.literal("reasoning"),
            id: external_exports.string(),
            encrypted_content: external_exports.string().nullish(),
            summary: external_exports.array(
              external_exports.object({
                type: external_exports.literal("summary_text"),
                text: external_exports.string()
              })
            )
          }),
          external_exports.object({
            type: external_exports.literal("mcp_call"),
            id: external_exports.string(),
            status: external_exports.string(),
            arguments: external_exports.string(),
            name: external_exports.string(),
            server_label: external_exports.string(),
            output: external_exports.string().nullish(),
            error: external_exports.union([
              external_exports.string(),
              external_exports.object({
                type: external_exports.string().optional(),
                code: external_exports.union([external_exports.number(), external_exports.string()]).optional(),
                message: external_exports.string().optional()
              }).loose()
            ]).nullish(),
            approval_request_id: external_exports.string().nullish()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_list_tools"),
            id: external_exports.string(),
            server_label: external_exports.string(),
            tools: external_exports.array(
              external_exports.object({
                name: external_exports.string(),
                description: external_exports.string().optional(),
                input_schema: external_exports.any(),
                annotations: external_exports.record(external_exports.string(), external_exports.unknown()).optional()
              })
            ),
            error: external_exports.union([
              external_exports.string(),
              external_exports.object({
                type: external_exports.string().optional(),
                code: external_exports.union([external_exports.number(), external_exports.string()]).optional(),
                message: external_exports.string().optional()
              }).loose()
            ]).optional()
          }),
          external_exports.object({
            type: external_exports.literal("mcp_approval_request"),
            id: external_exports.string(),
            server_label: external_exports.string(),
            name: external_exports.string(),
            arguments: external_exports.string(),
            approval_request_id: external_exports.string().optional()
          }),
          external_exports.object({
            type: external_exports.literal("apply_patch_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed"]),
            operation: external_exports.discriminatedUnion("type", [
              external_exports.object({
                type: external_exports.literal("create_file"),
                path: external_exports.string(),
                diff: external_exports.string()
              }),
              external_exports.object({
                type: external_exports.literal("delete_file"),
                path: external_exports.string()
              }),
              external_exports.object({
                type: external_exports.literal("update_file"),
                path: external_exports.string(),
                diff: external_exports.string()
              })
            ])
          }),
          external_exports.object({
            type: external_exports.literal("shell_call"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            action: external_exports.object({
              commands: external_exports.array(external_exports.string())
            })
          }),
          external_exports.object({
            type: external_exports.literal("shell_call_output"),
            id: external_exports.string(),
            call_id: external_exports.string(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            output: external_exports.array(
              external_exports.object({
                stdout: external_exports.string(),
                stderr: external_exports.string(),
                outcome: external_exports.discriminatedUnion("type", [
                  external_exports.object({ type: external_exports.literal("timeout") }),
                  external_exports.object({
                    type: external_exports.literal("exit"),
                    exit_code: external_exports.number()
                  })
                ])
              })
            )
          }),
          external_exports.object({
            type: external_exports.literal("tool_search_call"),
            id: external_exports.string(),
            execution: external_exports.enum(["server", "client"]),
            call_id: external_exports.string().nullable(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            arguments: external_exports.unknown()
          }),
          external_exports.object({
            type: external_exports.literal("tool_search_output"),
            id: external_exports.string(),
            execution: external_exports.enum(["server", "client"]),
            call_id: external_exports.string().nullable(),
            status: external_exports.enum(["in_progress", "completed", "incomplete"]),
            tools: external_exports.array(external_exports.record(external_exports.string(), jsonValueSchema2.optional()))
          })
        ])
      ).optional(),
      service_tier: external_exports.string().nullish(),
      incomplete_details: external_exports.object({ reason: external_exports.string() }).nullish(),
      usage: external_exports.object({
        input_tokens: external_exports.number(),
        input_tokens_details: external_exports.object({ cached_tokens: external_exports.number().nullish() }).nullish(),
        output_tokens: external_exports.number(),
        output_tokens_details: external_exports.object({ reasoning_tokens: external_exports.number().nullish() }).nullish()
      }).optional()
    })
  )
);
var TOP_LOGPROBS_MAX = 20;
var openaiResponsesReasoningModelIds = [
  "o1",
  "o1-2024-12-17",
  "o3",
  "o3-2025-04-16",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o4-mini",
  "o4-mini-2025-04-16",
  "gpt-5",
  "gpt-5-2025-08-07",
  "gpt-5-codex",
  "gpt-5-mini",
  "gpt-5-mini-2025-08-07",
  "gpt-5-nano",
  "gpt-5-nano-2025-08-07",
  "gpt-5-pro",
  "gpt-5-pro-2025-10-06",
  "gpt-5.1",
  "gpt-5.1-chat-latest",
  "gpt-5.1-codex-mini",
  "gpt-5.1-codex",
  "gpt-5.1-codex-max",
  "gpt-5.2",
  "gpt-5.2-chat-latest",
  "gpt-5.2-pro",
  "gpt-5.2-codex",
  "gpt-5.3-chat-latest",
  "gpt-5.3-codex",
  "gpt-5.4",
  "gpt-5.4-2026-03-05",
  "gpt-5.4-mini",
  "gpt-5.4-mini-2026-03-17",
  "gpt-5.4-nano",
  "gpt-5.4-nano-2026-03-17",
  "gpt-5.4-pro",
  "gpt-5.4-pro-2026-03-05"
];
var openaiResponsesModelIds = [
  "gpt-4.1",
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "gpt-4o-audio-preview",
  "gpt-4o-audio-preview-2024-12-17",
  "gpt-4o-search-preview",
  "gpt-4o-search-preview-2025-03-11",
  "gpt-4o-mini-search-preview",
  "gpt-4o-mini-search-preview-2025-03-11",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "gpt-5-chat-latest",
  ...openaiResponsesReasoningModelIds
];
var openaiLanguageModelResponsesOptionsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      /**
       * The ID of the OpenAI Conversation to continue.
       * You must create a conversation first via the OpenAI API.
       * Cannot be used in conjunction with `previousResponseId`.
       * Defaults to `undefined`.
       * @see https://platform.openai.com/docs/api-reference/conversations/create
       */
      conversation: external_exports.string().nullish(),
      /**
       * The set of extra fields to include in the response (advanced, usually not needed).
       * Example values: 'reasoning.encrypted_content', 'file_search_call.results', 'message.output_text.logprobs'.
       */
      include: external_exports.array(
        external_exports.enum([
          "reasoning.encrypted_content",
          // handled internally by default, only needed for unknown reasoning models
          "file_search_call.results",
          "message.output_text.logprobs"
        ])
      ).nullish(),
      /**
       * Instructions for the model.
       * They can be used to change the system or developer message when continuing a conversation using the `previousResponseId` option.
       * Defaults to `undefined`.
       */
      instructions: external_exports.string().nullish(),
      /**
       * Return the log probabilities of the tokens. Including logprobs will increase
       * the response size and can slow down response times. However, it can
       * be useful to better understand how the model is behaving.
       *
       * Setting to true will return the log probabilities of the tokens that
       * were generated.
       *
       * Setting to a number will return the log probabilities of the top n
       * tokens that were generated.
       *
       * @see https://platform.openai.com/docs/api-reference/responses/create
       * @see https://cookbook.openai.com/examples/using_logprobs
       */
      logprobs: external_exports.union([external_exports.boolean(), external_exports.number().min(1).max(TOP_LOGPROBS_MAX)]).optional(),
      /**
       * The maximum number of total calls to built-in tools that can be processed in a response.
       * This maximum number applies across all built-in tool calls, not per individual tool.
       * Any further attempts to call a tool by the model will be ignored.
       */
      maxToolCalls: external_exports.number().nullish(),
      /**
       * Additional metadata to store with the generation.
       */
      metadata: external_exports.any().nullish(),
      /**
       * Whether to use parallel tool calls. Defaults to `true`.
       */
      parallelToolCalls: external_exports.boolean().nullish(),
      /**
       * The ID of the previous response. You can use it to continue a conversation.
       * Defaults to `undefined`.
       */
      previousResponseId: external_exports.string().nullish(),
      /**
       * Sets a cache key to tie this prompt to cached prefixes for better caching performance.
       */
      promptCacheKey: external_exports.string().nullish(),
      /**
       * The retention policy for the prompt cache.
       * - 'in_memory': Default. Standard prompt caching behavior.
       * - '24h': Extended prompt caching that keeps cached prefixes active for up to 24 hours.
       *          Currently only available for 5.1 series models.
       *
       * @default 'in_memory'
       */
      promptCacheRetention: external_exports.enum(["in_memory", "24h"]).nullish(),
      /**
       * Reasoning effort for reasoning models. Defaults to `medium`. If you use
       * `providerOptions` to set the `reasoningEffort` option, this model setting will be ignored.
       * Valid values: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
       *
       * The 'none' type for `reasoningEffort` is only available for OpenAI's GPT-5.1
       * models. Also, the 'xhigh' type for `reasoningEffort` is only available for
       * OpenAI's GPT-5.1-Codex-Max model. Setting `reasoningEffort` to 'none' or 'xhigh' with unsupported models will result in
       * an error.
       */
      reasoningEffort: external_exports.string().nullish(),
      /**
       * Controls reasoning summary output from the model.
       * Set to "auto" to automatically receive the richest level available,
       * or "detailed" for comprehensive summaries.
       */
      reasoningSummary: external_exports.string().nullish(),
      /**
       * The identifier for safety monitoring and tracking.
       */
      safetyIdentifier: external_exports.string().nullish(),
      /**
       * Service tier for the request.
       * Set to 'flex' for 50% cheaper processing at the cost of increased latency (available for o3, o4-mini, and gpt-5 models).
       * Set to 'priority' for faster processing with Enterprise access (available for gpt-4, gpt-5, gpt-5-mini, o3, o4-mini; gpt-5-nano is not supported).
       *
       * Defaults to 'auto'.
       */
      serviceTier: external_exports.enum(["auto", "flex", "priority", "default"]).nullish(),
      /**
       * Whether to store the generation. Defaults to `true`.
       */
      store: external_exports.boolean().nullish(),
      /**
       * Whether to use strict JSON schema validation.
       * Defaults to `true`.
       */
      strictJsonSchema: external_exports.boolean().nullish(),
      /**
       * Controls the verbosity of the model's responses. Lower values ('low') will result
       * in more concise responses, while higher values ('high') will result in more verbose responses.
       * Valid values: 'low', 'medium', 'high'.
       */
      textVerbosity: external_exports.enum(["low", "medium", "high"]).nullish(),
      /**
       * Controls output truncation. 'auto' (default) performs truncation automatically;
       * 'disabled' turns truncation off.
       */
      truncation: external_exports.enum(["auto", "disabled"]).nullish(),
      /**
       * A unique identifier representing your end-user, which can help OpenAI to
       * monitor and detect abuse.
       * Defaults to `undefined`.
       * @see https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids
       */
      user: external_exports.string().nullish(),
      /**
       * Override the system message mode for this model.
       * - 'system': Use the 'system' role for system messages (default for most models)
       * - 'developer': Use the 'developer' role for system messages (used by reasoning models)
       * - 'remove': Remove system messages entirely
       *
       * If not specified, the mode is automatically determined based on the model.
       */
      systemMessageMode: external_exports.enum(["system", "developer", "remove"]).optional(),
      /**
       * Force treating this model as a reasoning model.
       *
       * This is useful for "stealth" reasoning models (e.g. via a custom baseURL)
       * where the model ID is not recognized by the SDK's allowlist.
       *
       * When enabled, the SDK applies reasoning-model parameter compatibility rules
       * and defaults `systemMessageMode` to `developer` unless overridden.
       */
      forceReasoning: external_exports.boolean().optional()
    })
  )
);
async function prepareResponsesTools({
  tools,
  toolChoice,
  toolNameMapping,
  customProviderToolNames
}) {
  var _a, _b;
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings };
  }
  const openaiTools2 = [];
  const resolvedCustomProviderToolNames = customProviderToolNames != null ? customProviderToolNames : /* @__PURE__ */ new Set();
  for (const tool of tools) {
    switch (tool.type) {
      case "function": {
        const openaiOptions = (_a = tool.providerOptions) == null ? void 0 : _a.openai;
        const deferLoading = openaiOptions == null ? void 0 : openaiOptions.deferLoading;
        openaiTools2.push({
          type: "function",
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
          ...tool.strict != null ? { strict: tool.strict } : {},
          ...deferLoading != null ? { defer_loading: deferLoading } : {}
        });
        break;
      }
      case "provider": {
        switch (tool.id) {
          case "openai.file_search": {
            const args = await validateTypes({
              value: tool.args,
              schema: fileSearchArgsSchema
            });
            openaiTools2.push({
              type: "file_search",
              vector_store_ids: args.vectorStoreIds,
              max_num_results: args.maxNumResults,
              ranking_options: args.ranking ? {
                ranker: args.ranking.ranker,
                score_threshold: args.ranking.scoreThreshold
              } : void 0,
              filters: args.filters
            });
            break;
          }
          case "openai.local_shell": {
            openaiTools2.push({
              type: "local_shell"
            });
            break;
          }
          case "openai.shell": {
            const args = await validateTypes({
              value: tool.args,
              schema: shellArgsSchema
            });
            openaiTools2.push({
              type: "shell",
              ...args.environment && {
                environment: mapShellEnvironment(args.environment)
              }
            });
            break;
          }
          case "openai.apply_patch": {
            openaiTools2.push({
              type: "apply_patch"
            });
            break;
          }
          case "openai.web_search_preview": {
            const args = await validateTypes({
              value: tool.args,
              schema: webSearchPreviewArgsSchema
            });
            openaiTools2.push({
              type: "web_search_preview",
              search_context_size: args.searchContextSize,
              user_location: args.userLocation
            });
            break;
          }
          case "openai.web_search": {
            const args = await validateTypes({
              value: tool.args,
              schema: webSearchArgsSchema
            });
            openaiTools2.push({
              type: "web_search",
              filters: args.filters != null ? { allowed_domains: args.filters.allowedDomains } : void 0,
              external_web_access: args.externalWebAccess,
              search_context_size: args.searchContextSize,
              user_location: args.userLocation
            });
            break;
          }
          case "openai.code_interpreter": {
            const args = await validateTypes({
              value: tool.args,
              schema: codeInterpreterArgsSchema
            });
            openaiTools2.push({
              type: "code_interpreter",
              container: args.container == null ? { type: "auto", file_ids: void 0 } : typeof args.container === "string" ? args.container : { type: "auto", file_ids: args.container.fileIds }
            });
            break;
          }
          case "openai.image_generation": {
            const args = await validateTypes({
              value: tool.args,
              schema: imageGenerationArgsSchema
            });
            openaiTools2.push({
              type: "image_generation",
              background: args.background,
              input_fidelity: args.inputFidelity,
              input_image_mask: args.inputImageMask ? {
                file_id: args.inputImageMask.fileId,
                image_url: args.inputImageMask.imageUrl
              } : void 0,
              model: args.model,
              moderation: args.moderation,
              partial_images: args.partialImages,
              quality: args.quality,
              output_compression: args.outputCompression,
              output_format: args.outputFormat,
              size: args.size
            });
            break;
          }
          case "openai.mcp": {
            const args = await validateTypes({
              value: tool.args,
              schema: mcpArgsSchema
            });
            const mapApprovalFilter = /* @__PURE__ */ __name((filter) => ({
              tool_names: filter.toolNames
            }), "mapApprovalFilter");
            const requireApproval = args.requireApproval;
            const requireApprovalParam = requireApproval == null ? void 0 : typeof requireApproval === "string" ? requireApproval : requireApproval.never != null ? { never: mapApprovalFilter(requireApproval.never) } : void 0;
            openaiTools2.push({
              type: "mcp",
              server_label: args.serverLabel,
              allowed_tools: Array.isArray(args.allowedTools) ? args.allowedTools : args.allowedTools ? {
                read_only: args.allowedTools.readOnly,
                tool_names: args.allowedTools.toolNames
              } : void 0,
              authorization: args.authorization,
              connector_id: args.connectorId,
              headers: args.headers,
              require_approval: requireApprovalParam != null ? requireApprovalParam : "never",
              server_description: args.serverDescription,
              server_url: args.serverUrl
            });
            break;
          }
          case "openai.custom": {
            const args = await validateTypes({
              value: tool.args,
              schema: customArgsSchema
            });
            openaiTools2.push({
              type: "custom",
              name: args.name,
              description: args.description,
              format: args.format
            });
            resolvedCustomProviderToolNames.add(args.name);
            break;
          }
          case "openai.tool_search": {
            const args = await validateTypes({
              value: tool.args,
              schema: toolSearchArgsSchema
            });
            openaiTools2.push({
              type: "tool_search",
              ...args.execution != null ? { execution: args.execution } : {},
              ...args.description != null ? { description: args.description } : {},
              ...args.parameters != null ? { parameters: args.parameters } : {}
            });
            break;
          }
        }
        break;
      }
      default:
        toolWarnings.push({
          type: "unsupported",
          feature: `function tool ${tool}`
        });
        break;
    }
  }
  if (toolChoice == null) {
    return { tools: openaiTools2, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: openaiTools2, toolChoice: type, toolWarnings };
    case "tool": {
      const resolvedToolName = (_b = toolNameMapping == null ? void 0 : toolNameMapping.toProviderToolName(toolChoice.toolName)) != null ? _b : toolChoice.toolName;
      return {
        tools: openaiTools2,
        toolChoice: resolvedToolName === "code_interpreter" || resolvedToolName === "file_search" || resolvedToolName === "image_generation" || resolvedToolName === "web_search_preview" || resolvedToolName === "web_search" || resolvedToolName === "mcp" || resolvedToolName === "apply_patch" ? { type: resolvedToolName } : resolvedCustomProviderToolNames.has(resolvedToolName) ? { type: "custom", name: resolvedToolName } : { type: "function", name: resolvedToolName },
        toolWarnings
      };
    }
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}
__name(prepareResponsesTools, "prepareResponsesTools");
function mapShellEnvironment(environment) {
  if (environment.type === "containerReference") {
    const env2 = environment;
    return {
      type: "container_reference",
      container_id: env2.containerId
    };
  }
  if (environment.type === "containerAuto") {
    const env2 = environment;
    return {
      type: "container_auto",
      file_ids: env2.fileIds,
      memory_limit: env2.memoryLimit,
      network_policy: env2.networkPolicy == null ? void 0 : env2.networkPolicy.type === "disabled" ? { type: "disabled" } : {
        type: "allowlist",
        allowed_domains: env2.networkPolicy.allowedDomains,
        domain_secrets: env2.networkPolicy.domainSecrets
      },
      skills: mapShellSkills(env2.skills)
    };
  }
  const env = environment;
  return {
    type: "local",
    skills: env.skills
  };
}
__name(mapShellEnvironment, "mapShellEnvironment");
function mapShellSkills(skills) {
  return skills == null ? void 0 : skills.map(
    (skill) => skill.type === "skillReference" ? {
      type: "skill_reference",
      skill_id: skill.skillId,
      version: skill.version
    } : {
      type: "inline",
      name: skill.name,
      description: skill.description,
      source: {
        type: "base64",
        media_type: skill.source.mediaType,
        data: skill.source.data
      }
    }
  );
}
__name(mapShellSkills, "mapShellSkills");
function extractApprovalRequestIdToToolCallIdMapping(prompt) {
  var _a, _b;
  const mapping = {};
  for (const message of prompt) {
    if (message.role !== "assistant") continue;
    for (const part of message.content) {
      if (part.type !== "tool-call") continue;
      const approvalRequestId = (_b = (_a = part.providerOptions) == null ? void 0 : _a.openai) == null ? void 0 : _b.approvalRequestId;
      if (approvalRequestId != null) {
        mapping[approvalRequestId] = part.toolCallId;
      }
    }
  }
  return mapping;
}
__name(extractApprovalRequestIdToToolCallIdMapping, "extractApprovalRequestIdToToolCallIdMapping");
var OpenAIResponsesLanguageModel = class {
  static {
    __name(this, "OpenAIResponsesLanguageModel");
  }
  constructor(modelId, config) {
    this.specificationVersion = "v3";
    this.supportedUrls = {
      "image/*": [/^https?:\/\/.*$/],
      "application/pdf": [/^https?:\/\/.*$/]
    };
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    maxOutputTokens,
    temperature,
    stopSequences,
    topP,
    topK,
    presencePenalty,
    frequencyPenalty,
    seed,
    prompt,
    providerOptions,
    tools,
    toolChoice,
    responseFormat
  }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const warnings = [];
    const modelCapabilities = getOpenAILanguageModelCapabilities(this.modelId);
    if (topK != null) {
      warnings.push({ type: "unsupported", feature: "topK" });
    }
    if (seed != null) {
      warnings.push({ type: "unsupported", feature: "seed" });
    }
    if (presencePenalty != null) {
      warnings.push({ type: "unsupported", feature: "presencePenalty" });
    }
    if (frequencyPenalty != null) {
      warnings.push({ type: "unsupported", feature: "frequencyPenalty" });
    }
    if (stopSequences != null) {
      warnings.push({ type: "unsupported", feature: "stopSequences" });
    }
    const providerOptionsName = this.config.provider.includes("azure") ? "azure" : "openai";
    let openaiOptions = await parseProviderOptions({
      provider: providerOptionsName,
      providerOptions,
      schema: openaiLanguageModelResponsesOptionsSchema
    });
    if (openaiOptions == null && providerOptionsName !== "openai") {
      openaiOptions = await parseProviderOptions({
        provider: "openai",
        providerOptions,
        schema: openaiLanguageModelResponsesOptionsSchema
      });
    }
    const isReasoningModel = (_a = openaiOptions == null ? void 0 : openaiOptions.forceReasoning) != null ? _a : modelCapabilities.isReasoningModel;
    if ((openaiOptions == null ? void 0 : openaiOptions.conversation) && (openaiOptions == null ? void 0 : openaiOptions.previousResponseId)) {
      warnings.push({
        type: "unsupported",
        feature: "conversation",
        details: "conversation and previousResponseId cannot be used together"
      });
    }
    const toolNameMapping = createToolNameMapping({
      tools,
      providerToolNames: {
        "openai.code_interpreter": "code_interpreter",
        "openai.file_search": "file_search",
        "openai.image_generation": "image_generation",
        "openai.local_shell": "local_shell",
        "openai.shell": "shell",
        "openai.web_search": "web_search",
        "openai.web_search_preview": "web_search_preview",
        "openai.mcp": "mcp",
        "openai.apply_patch": "apply_patch",
        "openai.tool_search": "tool_search"
      },
      resolveProviderToolName: /* @__PURE__ */ __name((tool) => tool.id === "openai.custom" ? tool.args.name : void 0, "resolveProviderToolName")
    });
    const customProviderToolNames = /* @__PURE__ */ new Set();
    const {
      tools: openaiTools2,
      toolChoice: openaiToolChoice,
      toolWarnings
    } = await prepareResponsesTools({
      tools,
      toolChoice,
      toolNameMapping,
      customProviderToolNames
    });
    const { input, warnings: inputWarnings } = await convertToOpenAIResponsesInput({
      prompt,
      toolNameMapping,
      systemMessageMode: (_b = openaiOptions == null ? void 0 : openaiOptions.systemMessageMode) != null ? _b : isReasoningModel ? "developer" : modelCapabilities.systemMessageMode,
      providerOptionsName,
      fileIdPrefixes: this.config.fileIdPrefixes,
      store: (_c = openaiOptions == null ? void 0 : openaiOptions.store) != null ? _c : true,
      hasConversation: (openaiOptions == null ? void 0 : openaiOptions.conversation) != null,
      hasLocalShellTool: hasOpenAITool("openai.local_shell"),
      hasShellTool: hasOpenAITool("openai.shell"),
      hasApplyPatchTool: hasOpenAITool("openai.apply_patch"),
      customProviderToolNames: customProviderToolNames.size > 0 ? customProviderToolNames : void 0
    });
    warnings.push(...inputWarnings);
    const strictJsonSchema = (_d = openaiOptions == null ? void 0 : openaiOptions.strictJsonSchema) != null ? _d : true;
    let include = openaiOptions == null ? void 0 : openaiOptions.include;
    function addInclude(key) {
      if (include == null) {
        include = [key];
      } else if (!include.includes(key)) {
        include = [...include, key];
      }
    }
    __name(addInclude, "addInclude");
    function hasOpenAITool(id) {
      return (tools == null ? void 0 : tools.find((tool) => tool.type === "provider" && tool.id === id)) != null;
    }
    __name(hasOpenAITool, "hasOpenAITool");
    const topLogprobs = typeof (openaiOptions == null ? void 0 : openaiOptions.logprobs) === "number" ? openaiOptions == null ? void 0 : openaiOptions.logprobs : (openaiOptions == null ? void 0 : openaiOptions.logprobs) === true ? TOP_LOGPROBS_MAX : void 0;
    if (topLogprobs) {
      addInclude("message.output_text.logprobs");
    }
    const webSearchToolName = (_e = tools == null ? void 0 : tools.find(
      (tool) => tool.type === "provider" && (tool.id === "openai.web_search" || tool.id === "openai.web_search_preview")
    )) == null ? void 0 : _e.name;
    if (webSearchToolName) {
      addInclude("web_search_call.action.sources");
    }
    if (hasOpenAITool("openai.code_interpreter")) {
      addInclude("code_interpreter_call.outputs");
    }
    const store = openaiOptions == null ? void 0 : openaiOptions.store;
    if (store === false && isReasoningModel) {
      addInclude("reasoning.encrypted_content");
    }
    const baseArgs = {
      model: this.modelId,
      input,
      temperature,
      top_p: topP,
      max_output_tokens: maxOutputTokens,
      ...((responseFormat == null ? void 0 : responseFormat.type) === "json" || (openaiOptions == null ? void 0 : openaiOptions.textVerbosity)) && {
        text: {
          ...(responseFormat == null ? void 0 : responseFormat.type) === "json" && {
            format: responseFormat.schema != null ? {
              type: "json_schema",
              strict: strictJsonSchema,
              name: (_f = responseFormat.name) != null ? _f : "response",
              description: responseFormat.description,
              schema: responseFormat.schema
            } : { type: "json_object" }
          },
          ...(openaiOptions == null ? void 0 : openaiOptions.textVerbosity) && {
            verbosity: openaiOptions.textVerbosity
          }
        }
      },
      // provider options:
      conversation: openaiOptions == null ? void 0 : openaiOptions.conversation,
      max_tool_calls: openaiOptions == null ? void 0 : openaiOptions.maxToolCalls,
      metadata: openaiOptions == null ? void 0 : openaiOptions.metadata,
      parallel_tool_calls: openaiOptions == null ? void 0 : openaiOptions.parallelToolCalls,
      previous_response_id: openaiOptions == null ? void 0 : openaiOptions.previousResponseId,
      store,
      user: openaiOptions == null ? void 0 : openaiOptions.user,
      instructions: openaiOptions == null ? void 0 : openaiOptions.instructions,
      service_tier: openaiOptions == null ? void 0 : openaiOptions.serviceTier,
      include,
      prompt_cache_key: openaiOptions == null ? void 0 : openaiOptions.promptCacheKey,
      prompt_cache_retention: openaiOptions == null ? void 0 : openaiOptions.promptCacheRetention,
      safety_identifier: openaiOptions == null ? void 0 : openaiOptions.safetyIdentifier,
      top_logprobs: topLogprobs,
      truncation: openaiOptions == null ? void 0 : openaiOptions.truncation,
      // model-specific settings:
      ...isReasoningModel && ((openaiOptions == null ? void 0 : openaiOptions.reasoningEffort) != null || (openaiOptions == null ? void 0 : openaiOptions.reasoningSummary) != null) && {
        reasoning: {
          ...(openaiOptions == null ? void 0 : openaiOptions.reasoningEffort) != null && {
            effort: openaiOptions.reasoningEffort
          },
          ...(openaiOptions == null ? void 0 : openaiOptions.reasoningSummary) != null && {
            summary: openaiOptions.reasoningSummary
          }
        }
      }
    };
    if (isReasoningModel) {
      if (!((openaiOptions == null ? void 0 : openaiOptions.reasoningEffort) === "none" && modelCapabilities.supportsNonReasoningParameters)) {
        if (baseArgs.temperature != null) {
          baseArgs.temperature = void 0;
          warnings.push({
            type: "unsupported",
            feature: "temperature",
            details: "temperature is not supported for reasoning models"
          });
        }
        if (baseArgs.top_p != null) {
          baseArgs.top_p = void 0;
          warnings.push({
            type: "unsupported",
            feature: "topP",
            details: "topP is not supported for reasoning models"
          });
        }
      }
    } else {
      if ((openaiOptions == null ? void 0 : openaiOptions.reasoningEffort) != null) {
        warnings.push({
          type: "unsupported",
          feature: "reasoningEffort",
          details: "reasoningEffort is not supported for non-reasoning models"
        });
      }
      if ((openaiOptions == null ? void 0 : openaiOptions.reasoningSummary) != null) {
        warnings.push({
          type: "unsupported",
          feature: "reasoningSummary",
          details: "reasoningSummary is not supported for non-reasoning models"
        });
      }
    }
    if ((openaiOptions == null ? void 0 : openaiOptions.serviceTier) === "flex" && !modelCapabilities.supportsFlexProcessing) {
      warnings.push({
        type: "unsupported",
        feature: "serviceTier",
        details: "flex processing is only available for o3, o4-mini, and gpt-5 models"
      });
      delete baseArgs.service_tier;
    }
    if ((openaiOptions == null ? void 0 : openaiOptions.serviceTier) === "priority" && !modelCapabilities.supportsPriorityProcessing) {
      warnings.push({
        type: "unsupported",
        feature: "serviceTier",
        details: "priority processing is only available for supported models (gpt-4, gpt-5, gpt-5-mini, o3, o4-mini) and requires Enterprise access. gpt-5-nano is not supported"
      });
      delete baseArgs.service_tier;
    }
    const shellToolEnvType = (_i = (_h = (_g = tools == null ? void 0 : tools.find(
      (tool) => tool.type === "provider" && tool.id === "openai.shell"
    )) == null ? void 0 : _g.args) == null ? void 0 : _h.environment) == null ? void 0 : _i.type;
    const isShellProviderExecuted = shellToolEnvType === "containerAuto" || shellToolEnvType === "containerReference";
    return {
      webSearchToolName,
      args: {
        ...baseArgs,
        tools: openaiTools2,
        tool_choice: openaiToolChoice
      },
      warnings: [...warnings, ...toolWarnings],
      store,
      toolNameMapping,
      providerOptionsName,
      isShellProviderExecuted
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B;
    const {
      args: body,
      warnings,
      webSearchToolName,
      toolNameMapping,
      providerOptionsName,
      isShellProviderExecuted
    } = await this.getArgs(options);
    const url = this.config.url({
      path: "/responses",
      modelId: this.modelId
    });
    const approvalRequestIdToDummyToolCallIdFromPrompt = extractApprovalRequestIdToToolCallIdMapping(options.prompt);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi({
      url,
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiResponsesResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    if (response.error) {
      throw new APICallError({
        message: response.error.message,
        url,
        requestBodyValues: body,
        statusCode: 400,
        responseHeaders,
        responseBody: rawResponse,
        isRetryable: false
      });
    }
    const content = [];
    const logprobs = [];
    let hasFunctionCall = false;
    const hostedToolSearchCallIds = [];
    for (const part of response.output) {
      switch (part.type) {
        case "reasoning": {
          if (part.summary.length === 0) {
            part.summary.push({ type: "summary_text", text: "" });
          }
          for (const summary of part.summary) {
            content.push({
              type: "reasoning",
              text: summary.text,
              providerMetadata: {
                [providerOptionsName]: {
                  itemId: part.id,
                  reasoningEncryptedContent: (_a = part.encrypted_content) != null ? _a : null
                }
              }
            });
          }
          break;
        }
        case "image_generation_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("image_generation"),
            input: "{}",
            providerExecuted: true
          });
          content.push({
            type: "tool-result",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("image_generation"),
            result: {
              result: part.result
            }
          });
          break;
        }
        case "tool_search_call": {
          const toolCallId = (_b = part.call_id) != null ? _b : part.id;
          const isHosted = part.execution === "server";
          if (isHosted) {
            hostedToolSearchCallIds.push(toolCallId);
          }
          content.push({
            type: "tool-call",
            toolCallId,
            toolName: toolNameMapping.toCustomToolName("tool_search"),
            input: JSON.stringify({
              arguments: part.arguments,
              call_id: part.call_id
            }),
            ...isHosted ? { providerExecuted: true } : {},
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "tool_search_output": {
          const toolCallId = (_d = (_c = part.call_id) != null ? _c : hostedToolSearchCallIds.shift()) != null ? _d : part.id;
          content.push({
            type: "tool-result",
            toolCallId,
            toolName: toolNameMapping.toCustomToolName("tool_search"),
            result: {
              tools: part.tools
            },
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "local_shell_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.call_id,
            toolName: toolNameMapping.toCustomToolName("local_shell"),
            input: JSON.stringify({
              action: part.action
            }),
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "shell_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.call_id,
            toolName: toolNameMapping.toCustomToolName("shell"),
            input: JSON.stringify({
              action: {
                commands: part.action.commands
              }
            }),
            ...isShellProviderExecuted && { providerExecuted: true },
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "shell_call_output": {
          content.push({
            type: "tool-result",
            toolCallId: part.call_id,
            toolName: toolNameMapping.toCustomToolName("shell"),
            result: {
              output: part.output.map((item) => ({
                stdout: item.stdout,
                stderr: item.stderr,
                outcome: item.outcome.type === "exit" ? {
                  type: "exit",
                  exitCode: item.outcome.exit_code
                } : { type: "timeout" }
              }))
            }
          });
          break;
        }
        case "message": {
          for (const contentPart of part.content) {
            if (((_f = (_e = options.providerOptions) == null ? void 0 : _e[providerOptionsName]) == null ? void 0 : _f.logprobs) && contentPart.logprobs) {
              logprobs.push(contentPart.logprobs);
            }
            const providerMetadata2 = {
              itemId: part.id,
              ...part.phase != null && { phase: part.phase },
              ...contentPart.annotations.length > 0 && {
                annotations: contentPart.annotations
              }
            };
            content.push({
              type: "text",
              text: contentPart.text,
              providerMetadata: {
                [providerOptionsName]: providerMetadata2
              }
            });
            for (const annotation of contentPart.annotations) {
              if (annotation.type === "url_citation") {
                content.push({
                  type: "source",
                  sourceType: "url",
                  id: (_i = (_h = (_g = this.config).generateId) == null ? void 0 : _h.call(_g)) != null ? _i : generateId(),
                  url: annotation.url,
                  title: annotation.title
                });
              } else if (annotation.type === "file_citation") {
                content.push({
                  type: "source",
                  sourceType: "document",
                  id: (_l = (_k = (_j = this.config).generateId) == null ? void 0 : _k.call(_j)) != null ? _l : generateId(),
                  mediaType: "text/plain",
                  title: annotation.filename,
                  filename: annotation.filename,
                  providerMetadata: {
                    [providerOptionsName]: {
                      type: annotation.type,
                      fileId: annotation.file_id,
                      index: annotation.index
                    }
                  }
                });
              } else if (annotation.type === "container_file_citation") {
                content.push({
                  type: "source",
                  sourceType: "document",
                  id: (_o = (_n = (_m = this.config).generateId) == null ? void 0 : _n.call(_m)) != null ? _o : generateId(),
                  mediaType: "text/plain",
                  title: annotation.filename,
                  filename: annotation.filename,
                  providerMetadata: {
                    [providerOptionsName]: {
                      type: annotation.type,
                      fileId: annotation.file_id,
                      containerId: annotation.container_id
                    }
                  }
                });
              } else if (annotation.type === "file_path") {
                content.push({
                  type: "source",
                  sourceType: "document",
                  id: (_r = (_q = (_p = this.config).generateId) == null ? void 0 : _q.call(_p)) != null ? _r : generateId(),
                  mediaType: "application/octet-stream",
                  title: annotation.file_id,
                  filename: annotation.file_id,
                  providerMetadata: {
                    [providerOptionsName]: {
                      type: annotation.type,
                      fileId: annotation.file_id,
                      index: annotation.index
                    }
                  }
                });
              }
            }
          }
          break;
        }
        case "function_call": {
          hasFunctionCall = true;
          content.push({
            type: "tool-call",
            toolCallId: part.call_id,
            toolName: part.name,
            input: part.arguments,
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "custom_tool_call": {
          hasFunctionCall = true;
          const toolName = toolNameMapping.toCustomToolName(part.name);
          content.push({
            type: "tool-call",
            toolCallId: part.call_id,
            toolName,
            input: JSON.stringify(part.input),
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "web_search_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName(
              webSearchToolName != null ? webSearchToolName : "web_search"
            ),
            input: JSON.stringify({}),
            providerExecuted: true
          });
          content.push({
            type: "tool-result",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName(
              webSearchToolName != null ? webSearchToolName : "web_search"
            ),
            result: mapWebSearchOutput(part.action)
          });
          break;
        }
        case "mcp_call": {
          const toolCallId = part.approval_request_id != null ? (_s = approvalRequestIdToDummyToolCallIdFromPrompt[part.approval_request_id]) != null ? _s : part.id : part.id;
          const toolName = `mcp.${part.name}`;
          content.push({
            type: "tool-call",
            toolCallId,
            toolName,
            input: part.arguments,
            providerExecuted: true,
            dynamic: true
          });
          content.push({
            type: "tool-result",
            toolCallId,
            toolName,
            result: {
              type: "call",
              serverLabel: part.server_label,
              name: part.name,
              arguments: part.arguments,
              ...part.output != null ? { output: part.output } : {},
              ...part.error != null ? { error: part.error } : {}
            },
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
        case "mcp_list_tools": {
          break;
        }
        case "mcp_approval_request": {
          const approvalRequestId = (_t = part.approval_request_id) != null ? _t : part.id;
          const dummyToolCallId = (_w = (_v = (_u = this.config).generateId) == null ? void 0 : _v.call(_u)) != null ? _w : generateId();
          const toolName = `mcp.${part.name}`;
          content.push({
            type: "tool-call",
            toolCallId: dummyToolCallId,
            toolName,
            input: part.arguments,
            providerExecuted: true,
            dynamic: true
          });
          content.push({
            type: "tool-approval-request",
            approvalId: approvalRequestId,
            toolCallId: dummyToolCallId
          });
          break;
        }
        case "computer_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("computer_use"),
            input: "",
            providerExecuted: true
          });
          content.push({
            type: "tool-result",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("computer_use"),
            result: {
              type: "computer_use_tool_result",
              status: part.status || "completed"
            }
          });
          break;
        }
        case "file_search_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("file_search"),
            input: "{}",
            providerExecuted: true
          });
          content.push({
            type: "tool-result",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("file_search"),
            result: {
              queries: part.queries,
              results: (_y = (_x = part.results) == null ? void 0 : _x.map((result) => ({
                attributes: result.attributes,
                fileId: result.file_id,
                filename: result.filename,
                score: result.score,
                text: result.text
              }))) != null ? _y : null
            }
          });
          break;
        }
        case "code_interpreter_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("code_interpreter"),
            input: JSON.stringify({
              code: part.code,
              containerId: part.container_id
            }),
            providerExecuted: true
          });
          content.push({
            type: "tool-result",
            toolCallId: part.id,
            toolName: toolNameMapping.toCustomToolName("code_interpreter"),
            result: {
              outputs: part.outputs
            }
          });
          break;
        }
        case "apply_patch_call": {
          content.push({
            type: "tool-call",
            toolCallId: part.call_id,
            toolName: toolNameMapping.toCustomToolName("apply_patch"),
            input: JSON.stringify({
              callId: part.call_id,
              operation: part.operation
            }),
            providerMetadata: {
              [providerOptionsName]: {
                itemId: part.id
              }
            }
          });
          break;
        }
      }
    }
    const providerMetadata = {
      [providerOptionsName]: {
        responseId: response.id,
        ...logprobs.length > 0 ? { logprobs } : {},
        ...typeof response.service_tier === "string" ? { serviceTier: response.service_tier } : {}
      }
    };
    const usage = response.usage;
    return {
      content,
      finishReason: {
        unified: mapOpenAIResponseFinishReason({
          finishReason: (_z = response.incomplete_details) == null ? void 0 : _z.reason,
          hasFunctionCall
        }),
        raw: (_B = (_A = response.incomplete_details) == null ? void 0 : _A.reason) != null ? _B : void 0
      },
      usage: convertOpenAIResponsesUsage(usage),
      request: { body },
      response: {
        id: response.id,
        timestamp: new Date(response.created_at * 1e3),
        modelId: response.model,
        headers: responseHeaders,
        body: rawResponse
      },
      providerMetadata,
      warnings
    };
  }
  async doStream(options) {
    const {
      args: body,
      warnings,
      webSearchToolName,
      toolNameMapping,
      store,
      providerOptionsName,
      isShellProviderExecuted
    } = await this.getArgs(options);
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/responses",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: {
        ...body,
        stream: true
      },
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        openaiResponsesChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const self = this;
    const approvalRequestIdToDummyToolCallIdFromPrompt = extractApprovalRequestIdToToolCallIdMapping(options.prompt);
    const approvalRequestIdToDummyToolCallIdFromStream = /* @__PURE__ */ new Map();
    let finishReason = {
      unified: "other",
      raw: void 0
    };
    let usage = void 0;
    const logprobs = [];
    let responseId = null;
    const ongoingToolCalls = {};
    const ongoingAnnotations = [];
    let activeMessagePhase;
    let hasFunctionCall = false;
    const activeReasoning = {};
    let serviceTier;
    const hostedToolSearchCallIds = [];
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = { unified: "error", raw: void 0 };
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if (isResponseOutputItemAddedChunk(value)) {
              if (value.item.type === "function_call") {
                ongoingToolCalls[value.output_index] = {
                  toolName: value.item.name,
                  toolCallId: value.item.call_id
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: value.item.call_id,
                  toolName: value.item.name
                });
              } else if (value.item.type === "custom_tool_call") {
                const toolName = toolNameMapping.toCustomToolName(
                  value.item.name
                );
                ongoingToolCalls[value.output_index] = {
                  toolName,
                  toolCallId: value.item.call_id
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: value.item.call_id,
                  toolName
                });
              } else if (value.item.type === "web_search_call") {
                ongoingToolCalls[value.output_index] = {
                  toolName: toolNameMapping.toCustomToolName(
                    webSearchToolName != null ? webSearchToolName : "web_search"
                  ),
                  toolCallId: value.item.id
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: value.item.id,
                  toolName: toolNameMapping.toCustomToolName(
                    webSearchToolName != null ? webSearchToolName : "web_search"
                  ),
                  providerExecuted: true
                });
                controller.enqueue({
                  type: "tool-input-end",
                  id: value.item.id
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName(
                    webSearchToolName != null ? webSearchToolName : "web_search"
                  ),
                  input: JSON.stringify({}),
                  providerExecuted: true
                });
              } else if (value.item.type === "computer_call") {
                ongoingToolCalls[value.output_index] = {
                  toolName: toolNameMapping.toCustomToolName("computer_use"),
                  toolCallId: value.item.id
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("computer_use"),
                  providerExecuted: true
                });
              } else if (value.item.type === "code_interpreter_call") {
                ongoingToolCalls[value.output_index] = {
                  toolName: toolNameMapping.toCustomToolName("code_interpreter"),
                  toolCallId: value.item.id,
                  codeInterpreter: {
                    containerId: value.item.container_id
                  }
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("code_interpreter"),
                  providerExecuted: true
                });
                controller.enqueue({
                  type: "tool-input-delta",
                  id: value.item.id,
                  delta: `{"containerId":"${value.item.container_id}","code":"`
                });
              } else if (value.item.type === "file_search_call") {
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("file_search"),
                  input: "{}",
                  providerExecuted: true
                });
              } else if (value.item.type === "image_generation_call") {
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("image_generation"),
                  input: "{}",
                  providerExecuted: true
                });
              } else if (value.item.type === "tool_search_call") {
                const toolCallId = value.item.id;
                const toolName = toolNameMapping.toCustomToolName("tool_search");
                const isHosted = value.item.execution === "server";
                ongoingToolCalls[value.output_index] = {
                  toolName,
                  toolCallId,
                  toolSearchExecution: (_a = value.item.execution) != null ? _a : "server"
                };
                if (isHosted) {
                  controller.enqueue({
                    type: "tool-input-start",
                    id: toolCallId,
                    toolName,
                    providerExecuted: true
                  });
                }
              } else if (value.item.type === "tool_search_output") {
              } else if (value.item.type === "mcp_call" || value.item.type === "mcp_list_tools" || value.item.type === "mcp_approval_request") {
              } else if (value.item.type === "apply_patch_call") {
                const { call_id: callId, operation } = value.item;
                ongoingToolCalls[value.output_index] = {
                  toolName: toolNameMapping.toCustomToolName("apply_patch"),
                  toolCallId: callId,
                  applyPatch: {
                    // delete_file doesn't have diff
                    hasDiff: operation.type === "delete_file",
                    endEmitted: operation.type === "delete_file"
                  }
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: callId,
                  toolName: toolNameMapping.toCustomToolName("apply_patch")
                });
                if (operation.type === "delete_file") {
                  const inputString = JSON.stringify({
                    callId,
                    operation
                  });
                  controller.enqueue({
                    type: "tool-input-delta",
                    id: callId,
                    delta: inputString
                  });
                  controller.enqueue({
                    type: "tool-input-end",
                    id: callId
                  });
                } else {
                  controller.enqueue({
                    type: "tool-input-delta",
                    id: callId,
                    delta: `{"callId":"${escapeJSONDelta(callId)}","operation":{"type":"${escapeJSONDelta(operation.type)}","path":"${escapeJSONDelta(operation.path)}","diff":"`
                  });
                }
              } else if (value.item.type === "shell_call") {
                ongoingToolCalls[value.output_index] = {
                  toolName: toolNameMapping.toCustomToolName("shell"),
                  toolCallId: value.item.call_id
                };
              } else if (value.item.type === "shell_call_output") {
              } else if (value.item.type === "message") {
                ongoingAnnotations.splice(0, ongoingAnnotations.length);
                activeMessagePhase = (_b = value.item.phase) != null ? _b : void 0;
                controller.enqueue({
                  type: "text-start",
                  id: value.item.id,
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id,
                      ...value.item.phase != null && {
                        phase: value.item.phase
                      }
                    }
                  }
                });
              } else if (isResponseOutputItemAddedChunk(value) && value.item.type === "reasoning") {
                activeReasoning[value.item.id] = {
                  encryptedContent: value.item.encrypted_content,
                  summaryParts: { 0: "active" }
                };
                controller.enqueue({
                  type: "reasoning-start",
                  id: `${value.item.id}:0`,
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id,
                      reasoningEncryptedContent: (_c = value.item.encrypted_content) != null ? _c : null
                    }
                  }
                });
              }
            } else if (isResponseOutputItemDoneChunk(value)) {
              if (value.item.type === "message") {
                const phase = (_d = value.item.phase) != null ? _d : activeMessagePhase;
                activeMessagePhase = void 0;
                controller.enqueue({
                  type: "text-end",
                  id: value.item.id,
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id,
                      ...phase != null && { phase },
                      ...ongoingAnnotations.length > 0 && {
                        annotations: ongoingAnnotations
                      }
                    }
                  }
                });
              } else if (value.item.type === "function_call") {
                ongoingToolCalls[value.output_index] = void 0;
                hasFunctionCall = true;
                controller.enqueue({
                  type: "tool-input-end",
                  id: value.item.call_id
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.call_id,
                  toolName: value.item.name,
                  input: value.item.arguments,
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id
                    }
                  }
                });
              } else if (value.item.type === "custom_tool_call") {
                ongoingToolCalls[value.output_index] = void 0;
                hasFunctionCall = true;
                const toolName = toolNameMapping.toCustomToolName(
                  value.item.name
                );
                controller.enqueue({
                  type: "tool-input-end",
                  id: value.item.call_id
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.call_id,
                  toolName,
                  input: JSON.stringify(value.item.input),
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id
                    }
                  }
                });
              } else if (value.item.type === "web_search_call") {
                ongoingToolCalls[value.output_index] = void 0;
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName(
                    webSearchToolName != null ? webSearchToolName : "web_search"
                  ),
                  result: mapWebSearchOutput(value.item.action)
                });
              } else if (value.item.type === "computer_call") {
                ongoingToolCalls[value.output_index] = void 0;
                controller.enqueue({
                  type: "tool-input-end",
                  id: value.item.id
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("computer_use"),
                  input: "",
                  providerExecuted: true
                });
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("computer_use"),
                  result: {
                    type: "computer_use_tool_result",
                    status: value.item.status || "completed"
                  }
                });
              } else if (value.item.type === "file_search_call") {
                ongoingToolCalls[value.output_index] = void 0;
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("file_search"),
                  result: {
                    queries: value.item.queries,
                    results: (_f = (_e = value.item.results) == null ? void 0 : _e.map((result) => ({
                      attributes: result.attributes,
                      fileId: result.file_id,
                      filename: result.filename,
                      score: result.score,
                      text: result.text
                    }))) != null ? _f : null
                  }
                });
              } else if (value.item.type === "code_interpreter_call") {
                ongoingToolCalls[value.output_index] = void 0;
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("code_interpreter"),
                  result: {
                    outputs: value.item.outputs
                  }
                });
              } else if (value.item.type === "image_generation_call") {
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.item.id,
                  toolName: toolNameMapping.toCustomToolName("image_generation"),
                  result: {
                    result: value.item.result
                  }
                });
              } else if (value.item.type === "tool_search_call") {
                const toolCall = ongoingToolCalls[value.output_index];
                const isHosted = value.item.execution === "server";
                if (toolCall != null) {
                  const toolCallId = isHosted ? toolCall.toolCallId : (_g = value.item.call_id) != null ? _g : value.item.id;
                  if (isHosted) {
                    hostedToolSearchCallIds.push(toolCallId);
                  } else {
                    controller.enqueue({
                      type: "tool-input-start",
                      id: toolCallId,
                      toolName: toolCall.toolName
                    });
                  }
                  controller.enqueue({
                    type: "tool-input-end",
                    id: toolCallId
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId,
                    toolName: toolCall.toolName,
                    input: JSON.stringify({
                      arguments: value.item.arguments,
                      call_id: isHosted ? null : toolCallId
                    }),
                    ...isHosted ? { providerExecuted: true } : {},
                    providerMetadata: {
                      [providerOptionsName]: {
                        itemId: value.item.id
                      }
                    }
                  });
                }
                ongoingToolCalls[value.output_index] = void 0;
              } else if (value.item.type === "tool_search_output") {
                const toolCallId = (_i = (_h = value.item.call_id) != null ? _h : hostedToolSearchCallIds.shift()) != null ? _i : value.item.id;
                controller.enqueue({
                  type: "tool-result",
                  toolCallId,
                  toolName: toolNameMapping.toCustomToolName("tool_search"),
                  result: {
                    tools: value.item.tools
                  },
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id
                    }
                  }
                });
              } else if (value.item.type === "mcp_call") {
                ongoingToolCalls[value.output_index] = void 0;
                const approvalRequestId = (_j = value.item.approval_request_id) != null ? _j : void 0;
                const aliasedToolCallId = approvalRequestId != null ? (_l = (_k = approvalRequestIdToDummyToolCallIdFromStream.get(
                  approvalRequestId
                )) != null ? _k : approvalRequestIdToDummyToolCallIdFromPrompt[approvalRequestId]) != null ? _l : value.item.id : value.item.id;
                const toolName = `mcp.${value.item.name}`;
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: aliasedToolCallId,
                  toolName,
                  input: value.item.arguments,
                  providerExecuted: true,
                  dynamic: true
                });
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: aliasedToolCallId,
                  toolName,
                  result: {
                    type: "call",
                    serverLabel: value.item.server_label,
                    name: value.item.name,
                    arguments: value.item.arguments,
                    ...value.item.output != null ? { output: value.item.output } : {},
                    ...value.item.error != null ? { error: value.item.error } : {}
                  },
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item.id
                    }
                  }
                });
              } else if (value.item.type === "mcp_list_tools") {
                ongoingToolCalls[value.output_index] = void 0;
              } else if (value.item.type === "apply_patch_call") {
                const toolCall = ongoingToolCalls[value.output_index];
                if ((toolCall == null ? void 0 : toolCall.applyPatch) && !toolCall.applyPatch.endEmitted && value.item.operation.type !== "delete_file") {
                  if (!toolCall.applyPatch.hasDiff) {
                    controller.enqueue({
                      type: "tool-input-delta",
                      id: toolCall.toolCallId,
                      delta: escapeJSONDelta(value.item.operation.diff)
                    });
                  }
                  controller.enqueue({
                    type: "tool-input-delta",
                    id: toolCall.toolCallId,
                    delta: '"}}'
                  });
                  controller.enqueue({
                    type: "tool-input-end",
                    id: toolCall.toolCallId
                  });
                  toolCall.applyPatch.endEmitted = true;
                }
                if (toolCall && value.item.status === "completed") {
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: toolCall.toolCallId,
                    toolName: toolNameMapping.toCustomToolName("apply_patch"),
                    input: JSON.stringify({
                      callId: value.item.call_id,
                      operation: value.item.operation
                    }),
                    providerMetadata: {
                      [providerOptionsName]: {
                        itemId: value.item.id
                      }
                    }
                  });
                }
                ongoingToolCalls[value.output_index] = void 0;
              } else if (value.item.type === "mcp_approval_request") {
                ongoingToolCalls[value.output_index] = void 0;
                const dummyToolCallId = (_o = (_n = (_m = self.config).generateId) == null ? void 0 : _n.call(_m)) != null ? _o : generateId();
                const approvalRequestId = (_p = value.item.approval_request_id) != null ? _p : value.item.id;
                approvalRequestIdToDummyToolCallIdFromStream.set(
                  approvalRequestId,
                  dummyToolCallId
                );
                const toolName = `mcp.${value.item.name}`;
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: dummyToolCallId,
                  toolName,
                  input: value.item.arguments,
                  providerExecuted: true,
                  dynamic: true
                });
                controller.enqueue({
                  type: "tool-approval-request",
                  approvalId: approvalRequestId,
                  toolCallId: dummyToolCallId
                });
              } else if (value.item.type === "local_shell_call") {
                ongoingToolCalls[value.output_index] = void 0;
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.call_id,
                  toolName: toolNameMapping.toCustomToolName("local_shell"),
                  input: JSON.stringify({
                    action: {
                      type: "exec",
                      command: value.item.action.command,
                      timeoutMs: value.item.action.timeout_ms,
                      user: value.item.action.user,
                      workingDirectory: value.item.action.working_directory,
                      env: value.item.action.env
                    }
                  }),
                  providerMetadata: {
                    [providerOptionsName]: { itemId: value.item.id }
                  }
                });
              } else if (value.item.type === "shell_call") {
                ongoingToolCalls[value.output_index] = void 0;
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: value.item.call_id,
                  toolName: toolNameMapping.toCustomToolName("shell"),
                  input: JSON.stringify({
                    action: {
                      commands: value.item.action.commands
                    }
                  }),
                  ...isShellProviderExecuted && {
                    providerExecuted: true
                  },
                  providerMetadata: {
                    [providerOptionsName]: { itemId: value.item.id }
                  }
                });
              } else if (value.item.type === "shell_call_output") {
                controller.enqueue({
                  type: "tool-result",
                  toolCallId: value.item.call_id,
                  toolName: toolNameMapping.toCustomToolName("shell"),
                  result: {
                    output: value.item.output.map(
                      (item) => ({
                        stdout: item.stdout,
                        stderr: item.stderr,
                        outcome: item.outcome.type === "exit" ? {
                          type: "exit",
                          exitCode: item.outcome.exit_code
                        } : { type: "timeout" }
                      })
                    )
                  }
                });
              } else if (value.item.type === "reasoning") {
                const activeReasoningPart = activeReasoning[value.item.id];
                const summaryPartIndices = Object.entries(
                  activeReasoningPart.summaryParts
                ).filter(
                  ([_, status]) => status === "active" || status === "can-conclude"
                ).map(([summaryIndex]) => summaryIndex);
                for (const summaryIndex of summaryPartIndices) {
                  controller.enqueue({
                    type: "reasoning-end",
                    id: `${value.item.id}:${summaryIndex}`,
                    providerMetadata: {
                      [providerOptionsName]: {
                        itemId: value.item.id,
                        reasoningEncryptedContent: (_q = value.item.encrypted_content) != null ? _q : null
                      }
                    }
                  });
                }
                delete activeReasoning[value.item.id];
              }
            } else if (isResponseFunctionCallArgumentsDeltaChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if (toolCall != null) {
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.toolCallId,
                  delta: value.delta
                });
              }
            } else if (isResponseCustomToolCallInputDeltaChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if (toolCall != null) {
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.toolCallId,
                  delta: value.delta
                });
              }
            } else if (isResponseApplyPatchCallOperationDiffDeltaChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if (toolCall == null ? void 0 : toolCall.applyPatch) {
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.toolCallId,
                  delta: escapeJSONDelta(value.delta)
                });
                toolCall.applyPatch.hasDiff = true;
              }
            } else if (isResponseApplyPatchCallOperationDiffDoneChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if ((toolCall == null ? void 0 : toolCall.applyPatch) && !toolCall.applyPatch.endEmitted) {
                if (!toolCall.applyPatch.hasDiff) {
                  controller.enqueue({
                    type: "tool-input-delta",
                    id: toolCall.toolCallId,
                    delta: escapeJSONDelta(value.diff)
                  });
                  toolCall.applyPatch.hasDiff = true;
                }
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.toolCallId,
                  delta: '"}}'
                });
                controller.enqueue({
                  type: "tool-input-end",
                  id: toolCall.toolCallId
                });
                toolCall.applyPatch.endEmitted = true;
              }
            } else if (isResponseImageGenerationCallPartialImageChunk(value)) {
              controller.enqueue({
                type: "tool-result",
                toolCallId: value.item_id,
                toolName: toolNameMapping.toCustomToolName("image_generation"),
                result: {
                  result: value.partial_image_b64
                },
                preliminary: true
              });
            } else if (isResponseCodeInterpreterCallCodeDeltaChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if (toolCall != null) {
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.toolCallId,
                  delta: escapeJSONDelta(value.delta)
                });
              }
            } else if (isResponseCodeInterpreterCallCodeDoneChunk(value)) {
              const toolCall = ongoingToolCalls[value.output_index];
              if (toolCall != null) {
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.toolCallId,
                  delta: '"}'
                });
                controller.enqueue({
                  type: "tool-input-end",
                  id: toolCall.toolCallId
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallId: toolCall.toolCallId,
                  toolName: toolNameMapping.toCustomToolName("code_interpreter"),
                  input: JSON.stringify({
                    code: value.code,
                    containerId: toolCall.codeInterpreter.containerId
                  }),
                  providerExecuted: true
                });
              }
            } else if (isResponseCreatedChunk(value)) {
              responseId = value.response.id;
              controller.enqueue({
                type: "response-metadata",
                id: value.response.id,
                timestamp: new Date(value.response.created_at * 1e3),
                modelId: value.response.model
              });
            } else if (isTextDeltaChunk(value)) {
              controller.enqueue({
                type: "text-delta",
                id: value.item_id,
                delta: value.delta
              });
              if (((_s = (_r = options.providerOptions) == null ? void 0 : _r[providerOptionsName]) == null ? void 0 : _s.logprobs) && value.logprobs) {
                logprobs.push(value.logprobs);
              }
            } else if (value.type === "response.reasoning_summary_part.added") {
              if (value.summary_index > 0) {
                const activeReasoningPart = activeReasoning[value.item_id];
                activeReasoningPart.summaryParts[value.summary_index] = "active";
                for (const summaryIndex of Object.keys(
                  activeReasoningPart.summaryParts
                )) {
                  if (activeReasoningPart.summaryParts[summaryIndex] === "can-conclude") {
                    controller.enqueue({
                      type: "reasoning-end",
                      id: `${value.item_id}:${summaryIndex}`,
                      providerMetadata: {
                        [providerOptionsName]: {
                          itemId: value.item_id
                        }
                      }
                    });
                    activeReasoningPart.summaryParts[summaryIndex] = "concluded";
                  }
                }
                controller.enqueue({
                  type: "reasoning-start",
                  id: `${value.item_id}:${value.summary_index}`,
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item_id,
                      reasoningEncryptedContent: (_u = (_t = activeReasoning[value.item_id]) == null ? void 0 : _t.encryptedContent) != null ? _u : null
                    }
                  }
                });
              }
            } else if (value.type === "response.reasoning_summary_text.delta") {
              controller.enqueue({
                type: "reasoning-delta",
                id: `${value.item_id}:${value.summary_index}`,
                delta: value.delta,
                providerMetadata: {
                  [providerOptionsName]: {
                    itemId: value.item_id
                  }
                }
              });
            } else if (value.type === "response.reasoning_summary_part.done") {
              if (store) {
                controller.enqueue({
                  type: "reasoning-end",
                  id: `${value.item_id}:${value.summary_index}`,
                  providerMetadata: {
                    [providerOptionsName]: {
                      itemId: value.item_id
                    }
                  }
                });
                activeReasoning[value.item_id].summaryParts[value.summary_index] = "concluded";
              } else {
                activeReasoning[value.item_id].summaryParts[value.summary_index] = "can-conclude";
              }
            } else if (isResponseFinishedChunk(value)) {
              finishReason = {
                unified: mapOpenAIResponseFinishReason({
                  finishReason: (_v = value.response.incomplete_details) == null ? void 0 : _v.reason,
                  hasFunctionCall
                }),
                raw: (_x = (_w = value.response.incomplete_details) == null ? void 0 : _w.reason) != null ? _x : void 0
              };
              usage = value.response.usage;
              if (typeof value.response.service_tier === "string") {
                serviceTier = value.response.service_tier;
              }
            } else if (isResponseFailedChunk(value)) {
              const incompleteReason = (_y = value.response.incomplete_details) == null ? void 0 : _y.reason;
              finishReason = {
                unified: incompleteReason ? mapOpenAIResponseFinishReason({
                  finishReason: incompleteReason,
                  hasFunctionCall
                }) : "error",
                raw: incompleteReason != null ? incompleteReason : "error"
              };
              usage = (_z = value.response.usage) != null ? _z : void 0;
            } else if (isResponseAnnotationAddedChunk(value)) {
              ongoingAnnotations.push(value.annotation);
              if (value.annotation.type === "url_citation") {
                controller.enqueue({
                  type: "source",
                  sourceType: "url",
                  id: (_C = (_B = (_A = self.config).generateId) == null ? void 0 : _B.call(_A)) != null ? _C : generateId(),
                  url: value.annotation.url,
                  title: value.annotation.title
                });
              } else if (value.annotation.type === "file_citation") {
                controller.enqueue({
                  type: "source",
                  sourceType: "document",
                  id: (_F = (_E = (_D = self.config).generateId) == null ? void 0 : _E.call(_D)) != null ? _F : generateId(),
                  mediaType: "text/plain",
                  title: value.annotation.filename,
                  filename: value.annotation.filename,
                  providerMetadata: {
                    [providerOptionsName]: {
                      type: value.annotation.type,
                      fileId: value.annotation.file_id,
                      index: value.annotation.index
                    }
                  }
                });
              } else if (value.annotation.type === "container_file_citation") {
                controller.enqueue({
                  type: "source",
                  sourceType: "document",
                  id: (_I = (_H = (_G = self.config).generateId) == null ? void 0 : _H.call(_G)) != null ? _I : generateId(),
                  mediaType: "text/plain",
                  title: value.annotation.filename,
                  filename: value.annotation.filename,
                  providerMetadata: {
                    [providerOptionsName]: {
                      type: value.annotation.type,
                      fileId: value.annotation.file_id,
                      containerId: value.annotation.container_id
                    }
                  }
                });
              } else if (value.annotation.type === "file_path") {
                controller.enqueue({
                  type: "source",
                  sourceType: "document",
                  id: (_L = (_K = (_J = self.config).generateId) == null ? void 0 : _K.call(_J)) != null ? _L : generateId(),
                  mediaType: "application/octet-stream",
                  title: value.annotation.file_id,
                  filename: value.annotation.file_id,
                  providerMetadata: {
                    [providerOptionsName]: {
                      type: value.annotation.type,
                      fileId: value.annotation.file_id,
                      index: value.annotation.index
                    }
                  }
                });
              }
            } else if (isErrorChunk(value)) {
              controller.enqueue({ type: "error", error: value });
            }
          },
          flush(controller) {
            const providerMetadata = {
              [providerOptionsName]: {
                responseId,
                ...logprobs.length > 0 ? { logprobs } : {},
                ...serviceTier !== void 0 ? { serviceTier } : {}
              }
            };
            controller.enqueue({
              type: "finish",
              finishReason,
              usage: convertOpenAIResponsesUsage(usage),
              providerMetadata
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
function isTextDeltaChunk(chunk) {
  return chunk.type === "response.output_text.delta";
}
__name(isTextDeltaChunk, "isTextDeltaChunk");
function isResponseOutputItemDoneChunk(chunk) {
  return chunk.type === "response.output_item.done";
}
__name(isResponseOutputItemDoneChunk, "isResponseOutputItemDoneChunk");
function isResponseFinishedChunk(chunk) {
  return chunk.type === "response.completed" || chunk.type === "response.incomplete";
}
__name(isResponseFinishedChunk, "isResponseFinishedChunk");
function isResponseFailedChunk(chunk) {
  return chunk.type === "response.failed";
}
__name(isResponseFailedChunk, "isResponseFailedChunk");
function isResponseCreatedChunk(chunk) {
  return chunk.type === "response.created";
}
__name(isResponseCreatedChunk, "isResponseCreatedChunk");
function isResponseFunctionCallArgumentsDeltaChunk(chunk) {
  return chunk.type === "response.function_call_arguments.delta";
}
__name(isResponseFunctionCallArgumentsDeltaChunk, "isResponseFunctionCallArgumentsDeltaChunk");
function isResponseCustomToolCallInputDeltaChunk(chunk) {
  return chunk.type === "response.custom_tool_call_input.delta";
}
__name(isResponseCustomToolCallInputDeltaChunk, "isResponseCustomToolCallInputDeltaChunk");
function isResponseImageGenerationCallPartialImageChunk(chunk) {
  return chunk.type === "response.image_generation_call.partial_image";
}
__name(isResponseImageGenerationCallPartialImageChunk, "isResponseImageGenerationCallPartialImageChunk");
function isResponseCodeInterpreterCallCodeDeltaChunk(chunk) {
  return chunk.type === "response.code_interpreter_call_code.delta";
}
__name(isResponseCodeInterpreterCallCodeDeltaChunk, "isResponseCodeInterpreterCallCodeDeltaChunk");
function isResponseCodeInterpreterCallCodeDoneChunk(chunk) {
  return chunk.type === "response.code_interpreter_call_code.done";
}
__name(isResponseCodeInterpreterCallCodeDoneChunk, "isResponseCodeInterpreterCallCodeDoneChunk");
function isResponseApplyPatchCallOperationDiffDeltaChunk(chunk) {
  return chunk.type === "response.apply_patch_call_operation_diff.delta";
}
__name(isResponseApplyPatchCallOperationDiffDeltaChunk, "isResponseApplyPatchCallOperationDiffDeltaChunk");
function isResponseApplyPatchCallOperationDiffDoneChunk(chunk) {
  return chunk.type === "response.apply_patch_call_operation_diff.done";
}
__name(isResponseApplyPatchCallOperationDiffDoneChunk, "isResponseApplyPatchCallOperationDiffDoneChunk");
function isResponseOutputItemAddedChunk(chunk) {
  return chunk.type === "response.output_item.added";
}
__name(isResponseOutputItemAddedChunk, "isResponseOutputItemAddedChunk");
function isResponseAnnotationAddedChunk(chunk) {
  return chunk.type === "response.output_text.annotation.added";
}
__name(isResponseAnnotationAddedChunk, "isResponseAnnotationAddedChunk");
function isErrorChunk(chunk) {
  return chunk.type === "error";
}
__name(isErrorChunk, "isErrorChunk");
function mapWebSearchOutput(action) {
  var _a;
  if (action == null) {
    return {};
  }
  switch (action.type) {
    case "search":
      return {
        action: { type: "search", query: (_a = action.query) != null ? _a : void 0 },
        // include sources when provided by the Responses API (behind include flag)
        ...action.sources != null && { sources: action.sources }
      };
    case "open_page":
      return { action: { type: "openPage", url: action.url } };
    case "find_in_page":
      return {
        action: {
          type: "findInPage",
          url: action.url,
          pattern: action.pattern
        }
      };
  }
}
__name(mapWebSearchOutput, "mapWebSearchOutput");
function escapeJSONDelta(delta) {
  return JSON.stringify(delta).slice(1, -1);
}
__name(escapeJSONDelta, "escapeJSONDelta");
var openaiSpeechModelOptionsSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      instructions: external_exports.string().nullish(),
      speed: external_exports.number().min(0.25).max(4).default(1).nullish()
    })
  )
);
var OpenAISpeechModel = class {
  static {
    __name(this, "OpenAISpeechModel");
  }
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v3";
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    text,
    voice = "alloy",
    outputFormat = "mp3",
    speed,
    instructions,
    language,
    providerOptions
  }) {
    const warnings = [];
    const openAIOptions = await parseProviderOptions({
      provider: "openai",
      providerOptions,
      schema: openaiSpeechModelOptionsSchema
    });
    const requestBody = {
      model: this.modelId,
      input: text,
      voice,
      response_format: "mp3",
      speed,
      instructions
    };
    if (outputFormat) {
      if (["mp3", "opus", "aac", "flac", "wav", "pcm"].includes(outputFormat)) {
        requestBody.response_format = outputFormat;
      } else {
        warnings.push({
          type: "unsupported",
          feature: "outputFormat",
          details: `Unsupported output format: ${outputFormat}. Using mp3 instead.`
        });
      }
    }
    if (openAIOptions) {
      const speechModelOptions = {};
      for (const key in speechModelOptions) {
        const value = speechModelOptions[key];
        if (value !== void 0) {
          requestBody[key] = value;
        }
      }
    }
    if (language) {
      warnings.push({
        type: "unsupported",
        feature: "language",
        details: `OpenAI speech models do not support language selection. Language parameter "${language}" was ignored.`
      });
    }
    return {
      requestBody,
      warnings
    };
  }
  async doGenerate(options) {
    var _a, _b, _c;
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { requestBody, warnings } = await this.getArgs(options);
    const {
      value: audio,
      responseHeaders,
      rawValue: rawResponse
    } = await postJsonToApi({
      url: this.config.url({
        path: "/audio/speech",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: requestBody,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createBinaryResponseHandler(),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    return {
      audio,
      warnings,
      request: {
        body: JSON.stringify(requestBody)
      },
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
        body: rawResponse
      }
    };
  }
};
var openaiTranscriptionResponseSchema = lazySchema(
  () => zodSchema(
    external_exports.object({
      text: external_exports.string(),
      language: external_exports.string().nullish(),
      duration: external_exports.number().nullish(),
      words: external_exports.array(
        external_exports.object({
          word: external_exports.string(),
          start: external_exports.number(),
          end: external_exports.number()
        })
      ).nullish(),
      segments: external_exports.array(
        external_exports.object({
          id: external_exports.number(),
          seek: external_exports.number(),
          start: external_exports.number(),
          end: external_exports.number(),
          text: external_exports.string(),
          tokens: external_exports.array(external_exports.number()),
          temperature: external_exports.number(),
          avg_logprob: external_exports.number(),
          compression_ratio: external_exports.number(),
          no_speech_prob: external_exports.number()
        })
      ).nullish()
    })
  )
);
var openAITranscriptionModelOptions = lazySchema(
  () => zodSchema(
    external_exports.object({
      /**
       * Additional information to include in the transcription response.
       */
      include: external_exports.array(external_exports.string()).optional(),
      /**
       * The language of the input audio in ISO-639-1 format.
       */
      language: external_exports.string().optional(),
      /**
       * An optional text to guide the model's style or continue a previous audio segment.
       */
      prompt: external_exports.string().optional(),
      /**
       * The sampling temperature, between 0 and 1.
       * @default 0
       */
      temperature: external_exports.number().min(0).max(1).default(0).optional(),
      /**
       * The timestamp granularities to populate for this transcription.
       * @default ['segment']
       */
      timestampGranularities: external_exports.array(external_exports.enum(["word", "segment"])).default(["segment"]).optional()
    })
  )
);
var languageMap = {
  afrikaans: "af",
  arabic: "ar",
  armenian: "hy",
  azerbaijani: "az",
  belarusian: "be",
  bosnian: "bs",
  bulgarian: "bg",
  catalan: "ca",
  chinese: "zh",
  croatian: "hr",
  czech: "cs",
  danish: "da",
  dutch: "nl",
  english: "en",
  estonian: "et",
  finnish: "fi",
  french: "fr",
  galician: "gl",
  german: "de",
  greek: "el",
  hebrew: "he",
  hindi: "hi",
  hungarian: "hu",
  icelandic: "is",
  indonesian: "id",
  italian: "it",
  japanese: "ja",
  kannada: "kn",
  kazakh: "kk",
  korean: "ko",
  latvian: "lv",
  lithuanian: "lt",
  macedonian: "mk",
  malay: "ms",
  marathi: "mr",
  maori: "mi",
  nepali: "ne",
  norwegian: "no",
  persian: "fa",
  polish: "pl",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  serbian: "sr",
  slovak: "sk",
  slovenian: "sl",
  spanish: "es",
  swahili: "sw",
  swedish: "sv",
  tagalog: "tl",
  tamil: "ta",
  thai: "th",
  turkish: "tr",
  ukrainian: "uk",
  urdu: "ur",
  vietnamese: "vi",
  welsh: "cy"
};
var OpenAITranscriptionModel = class {
  static {
    __name(this, "OpenAITranscriptionModel");
  }
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v3";
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    audio,
    mediaType,
    providerOptions
  }) {
    const warnings = [];
    const openAIOptions = await parseProviderOptions({
      provider: "openai",
      providerOptions,
      schema: openAITranscriptionModelOptions
    });
    const formData = new FormData();
    const blob = audio instanceof Uint8Array ? new Blob([audio]) : new Blob([convertBase64ToUint8Array(audio)]);
    formData.append("model", this.modelId);
    const fileExtension = mediaTypeToExtension(mediaType);
    formData.append(
      "file",
      new File([blob], "audio", { type: mediaType }),
      `audio.${fileExtension}`
    );
    if (openAIOptions) {
      const transcriptionModelOptions = {
        include: openAIOptions.include,
        language: openAIOptions.language,
        prompt: openAIOptions.prompt,
        // https://platform.openai.com/docs/api-reference/audio/createTranscription#audio_createtranscription-response_format
        // prefer verbose_json to get segments for models that support it
        response_format: [
          "gpt-4o-transcribe",
          "gpt-4o-mini-transcribe"
        ].includes(this.modelId) ? "json" : "verbose_json",
        temperature: openAIOptions.temperature,
        timestamp_granularities: openAIOptions.timestampGranularities
      };
      for (const [key, value] of Object.entries(transcriptionModelOptions)) {
        if (value != null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              formData.append(`${key}[]`, String(item));
            }
          } else {
            formData.append(key, String(value));
          }
        }
      }
    }
    return {
      formData,
      warnings
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { formData, warnings } = await this.getArgs(options);
    const {
      value: response,
      responseHeaders,
      rawValue: rawResponse
    } = await postFormDataToApi({
      url: this.config.url({
        path: "/audio/transcriptions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      formData,
      failedResponseHandler: openaiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        openaiTranscriptionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const language = response.language != null && response.language in languageMap ? languageMap[response.language] : void 0;
    return {
      text: response.text,
      segments: (_g = (_f = (_d = response.segments) == null ? void 0 : _d.map((segment) => ({
        text: segment.text,
        startSecond: segment.start,
        endSecond: segment.end
      }))) != null ? _f : (_e = response.words) == null ? void 0 : _e.map((word) => ({
        text: word.word,
        startSecond: word.start,
        endSecond: word.end
      }))) != null ? _g : [],
      language,
      durationInSeconds: (_h = response.duration) != null ? _h : void 0,
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
        body: rawResponse
      }
    };
  }
};
var VERSION = true ? "3.0.53" : "0.0.0-test";
function createOpenAI(options = {}) {
  var _a, _b;
  const baseURL = (_a = withoutTrailingSlash(
    loadOptionalSetting({
      settingValue: options.baseURL,
      environmentVariableName: "OPENAI_BASE_URL"
    })
  )) != null ? _a : "https://api.openai.com/v1";
  const providerName = (_b = options.name) != null ? _b : "openai";
  const getHeaders = /* @__PURE__ */ __name(() => withUserAgentSuffix(
    {
      Authorization: `Bearer ${loadApiKey({
        apiKey: options.apiKey,
        environmentVariableName: "OPENAI_API_KEY",
        description: "OpenAI"
      })}`,
      "OpenAI-Organization": options.organization,
      "OpenAI-Project": options.project,
      ...options.headers
    },
    `ai-sdk/openai/${VERSION}`
  ), "getHeaders");
  const createChatModel = /* @__PURE__ */ __name((modelId) => new OpenAIChatLanguageModel(modelId, {
    provider: `${providerName}.chat`,
    url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
    headers: getHeaders,
    fetch: options.fetch
  }), "createChatModel");
  const createCompletionModel = /* @__PURE__ */ __name((modelId) => new OpenAICompletionLanguageModel(modelId, {
    provider: `${providerName}.completion`,
    url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
    headers: getHeaders,
    fetch: options.fetch
  }), "createCompletionModel");
  const createEmbeddingModel = /* @__PURE__ */ __name((modelId) => new OpenAIEmbeddingModel(modelId, {
    provider: `${providerName}.embedding`,
    url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
    headers: getHeaders,
    fetch: options.fetch
  }), "createEmbeddingModel");
  const createImageModel = /* @__PURE__ */ __name((modelId) => new OpenAIImageModel(modelId, {
    provider: `${providerName}.image`,
    url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
    headers: getHeaders,
    fetch: options.fetch
  }), "createImageModel");
  const createTranscriptionModel = /* @__PURE__ */ __name((modelId) => new OpenAITranscriptionModel(modelId, {
    provider: `${providerName}.transcription`,
    url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
    headers: getHeaders,
    fetch: options.fetch
  }), "createTranscriptionModel");
  const createSpeechModel = /* @__PURE__ */ __name((modelId) => new OpenAISpeechModel(modelId, {
    provider: `${providerName}.speech`,
    url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
    headers: getHeaders,
    fetch: options.fetch
  }), "createSpeechModel");
  const createLanguageModel = /* @__PURE__ */ __name((modelId) => {
    if (new.target) {
      throw new Error(
        "The OpenAI model function cannot be called with the new keyword."
      );
    }
    return createResponsesModel(modelId);
  }, "createLanguageModel");
  const createResponsesModel = /* @__PURE__ */ __name((modelId) => {
    return new OpenAIResponsesLanguageModel(modelId, {
      provider: `${providerName}.responses`,
      url: /* @__PURE__ */ __name(({ path }) => `${baseURL}${path}`, "url"),
      headers: getHeaders,
      fetch: options.fetch,
      fileIdPrefixes: ["file-"]
    });
  }, "createResponsesModel");
  const provider = /* @__PURE__ */ __name(function(modelId) {
    return createLanguageModel(modelId);
  }, "provider");
  provider.specificationVersion = "v3";
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;
  provider.responses = createResponsesModel;
  provider.embedding = createEmbeddingModel;
  provider.embeddingModel = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;
  provider.image = createImageModel;
  provider.imageModel = createImageModel;
  provider.transcription = createTranscriptionModel;
  provider.transcriptionModel = createTranscriptionModel;
  provider.speech = createSpeechModel;
  provider.speechModel = createSpeechModel;
  provider.tools = openaiTools;
  return provider;
}
__name(createOpenAI, "createOpenAI");
var openai = createOpenAI();

// trigger/generate-spec.ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
var specPayloadSchema = external_exports.object({
  projectId: external_exports.string(),
  roomId: external_exports.string(),
  chatHistory: external_exports.array(
    external_exports.object({
      role: external_exports.enum(["user", "assistant"]),
      content: external_exports.string()
    })
  ),
  nodes: external_exports.array(external_exports.record(external_exports.string(), external_exports.unknown())),
  edges: external_exports.array(external_exports.record(external_exports.string(), external_exports.unknown()))
});
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set.");
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey
  });
}
__name(getOpenRouterClient, "getOpenRouterClient");
var SPEC_DIR = join(process.cwd(), "data", "specs");
var generateSpec = task({
  id: "generate-spec",
  retry: {
    maxAttempts: 2
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const parsed = specPayloadSchema.parse(payload);
    const openrouter = getOpenRouterClient();
    await metadata.set("status", "generating");
    await metadata.set("progress", 10);
    const chatContext = parsed.chatHistory.map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");
    const canvasJson = JSON.stringify(
      { nodes: parsed.nodes, edges: parsed.edges },
      null,
      2
    );
    await metadata.set("progress", 20);
    const result = await generateText({
      model: openrouter.chat(
        process.env.OPENROUTER_SPEC_MODEL ?? process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-exp:free"
      ),
      // maxOutputTokens: 8192,
      system: `You are a senior software architect. You generate comprehensive, production-ready technical specifications in Markdown format.

Given a system architecture diagram (nodes and edges) and the conversation history between a user and an AI architect, produce a detailed project specification.

The spec MUST include ALL of the following sections:

# Project Overview
Brief description of the system and its purpose.

# System Architecture
High-level description of all components and how they interact. Reference the nodes and edges.

# Component Details
For EACH node in the diagram, provide:
- **Purpose**: What it does
- **Technology**: Recommended stack
- **Key Responsibilities**: Bullet list
- **API Endpoints** (if applicable): Method, path, description

# Data Flow
Describe how data flows through the system based on the edges/connections.

# Database Schema
Propose tables/collections with fields, types, and relationships.

# API Specification
Full REST or GraphQL API design with endpoints, request/response shapes.

# Authentication & Authorization
How users and services authenticate.

# Deployment Architecture
Hosting, scaling, CI/CD recommendations.

# Error Handling & Monitoring
Logging, alerting, error recovery strategies.

# Security Considerations
OWASP-aligned security measures.

# Development Phases
Break the project into milestones with deliverables.

Output ONLY valid Markdown. No code fences wrapping the entire document. Be thorough and specific.`,
      prompt: `<conversation-history>
${chatContext}
</conversation-history>

<system-architecture>
${canvasJson}
</system-architecture>

Generate a comprehensive technical specification for this system.`
    });
    await metadata.set("progress", 80);
    const specContent = result.text;
    await mkdir(SPEC_DIR, { recursive: true });
    const filePath = join(SPEC_DIR, `${parsed.roomId}.md`);
    await writeFile(filePath, specContent, "utf-8");
    await metadata.set("progress", 90);
    await metadata.set("progress", 100);
    await metadata.set("status", "complete");
    return {
      filePath,
      specLength: specContent.length,
      roomId: parsed.roomId,
      projectId: parsed.projectId
    };
  }, "run")
});
export {
  generateSpec
};
//# sourceMappingURL=generate-spec.mjs.map
