import { c as create_ssr_component, a as setContext, v as validate_component, m as missing_component } from "./ssr.js";
import { a as afterUpdate } from "./ssr2.js";
import "./environment.js";
let public_env = {};
function set_private_env(environment) {
}
function set_public_env(environment) {
  public_env = environment;
}
let read_implementation = null;
function set_read_implementation(fn) {
  read_implementation = fn;
}
function set_manifest(_) {
}
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { constructors } = $$props;
  let { components = [] } = $$props;
  let { form } = $$props;
  let { data_0 = null } = $$props;
  let { data_1 = null } = $$props;
  {
    setContext("__svelte__", stores);
  }
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0) $$bindings.page(page);
  if ($$props.constructors === void 0 && $$bindings.constructors && constructors !== void 0) $$bindings.constructors(constructors);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0) $$bindings.components(components);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.data_0 === void 0 && $$bindings.data_0 && data_0 !== void 0) $$bindings.data_0(data_0);
  if ($$props.data_1 === void 0 && $$bindings.data_1 && data_1 !== void 0) $$bindings.data_1(data_1);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      stores.page.set(page);
    }
    $$rendered = `  ${constructors[1] ? `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      {
        data: data_0,
        params: page.params,
        this: components[0]
      },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(constructors[1] || missing_component, "svelte:component").$$render(
            $$result,
            {
              data: data_1,
              form,
              params: page.params,
              this: components[1]
            },
            {
              this: ($$value) => {
                components[1] = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}` : `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      {
        data: data_0,
        form,
        params: page.params,
        this: components[0]
      },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {}
    )}`} ${``}`;
  } while (!$$settled);
  return $$rendered;
});
const options = {
  app_template_contains_nonce: false,
  async: false,
  csp: { "mode": "auto", "directives": { "upgrade-insecure-requests": false, "block-all-mixed-content": false }, "reportOnly": { "upgrade-insecure-requests": false, "block-all-mixed-content": false } },
  csrf_check_origin: true,
  csrf_trusted_origins: [],
  embedded: false,
  env_public_prefix: "PUBLIC_",
  env_private_prefix: "",
  hash_routing: false,
  hooks: null,
  // added lazily, via `get_hooks`
  preload_strategy: "modulepreload",
  root: Root,
  service_worker: false,
  service_worker_options: void 0,
  templates: {
    app: ({ head, body, assets, nonce, env }) => '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <link rel="icon" href="' + assets + '/favicon.png" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="color-scheme" content="dark light" />\n    <link rel="stylesheet" href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css">\n    <script src="https://unpkg.com/telescopic-text/lib/index.js"><\/script>\n    <link\n      href="https://unpkg.com/telescopic-text/lib/index.css"\n      rel="stylesheet"\n    />\n  \n    ' + head + '\n\n    <style>\n      body {\n        --bg-1: #f6f3e1;\n        --text-1: #490303;\n        --bg-2: hsl(224, 100%, 11%);\n        --bg-3: hsl(206, 20%, 80%);\n        --fg-1: hsl(0, 0%, 0%);\n        --fg-2: hsl(0, 0%, 20%);\n        --fg-2: hsl(0, 0%, 30%);\n        --link: #558f6d;\n        --link-hover: #395ecf;\n        --link-active: #395ecf;\n        --line: #41413B;\n        --border-radius: 4px;\n        --font: Garamond, serif;\n        --font-extre: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,\n          Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;\n        --font-mono: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo,\n          Consolas, "DejaVu Sans Mono", monospace;\n        background: var(--bg-1);\n        color: var(--fg-1);\n        font-family: var(--font);\n        line-height: 1.5;\n        margin: 1rem;\n        height: calc(100vh - 2rem);\n        align-items: center;\n        justify-content: center;\n        background-color: var(--bg-1);\n        color: var(--text-1);\n        margin-bottom: 2 rem;\n      }\n\n      navbar-h1 {\n        font-size: 2rem;\n        color: var(--text-1);\n        background-color: var(--bg-1);\n        align-items: center;\n        justify-content: center;\n      }\n      blockquote {\n        color: hsl(235, 100%, 50%);\n        font-family: Georgia, "Times New Roman", Times, serif;\n        font-size: 1 rem;\n      }\n      hr.solid {\n        border-top: 3px solid #41413B;\n      }\n\n      h1 {\n        color: var(--text-1);\n        padding-bottom: 0em;\n      }\n      h2 {\n        color: var(--text-1);\n      }\n      h3 {\n        color: var(--text-1);\n      }\n      h4 {\n        color: var(--text-1);\n      }\n      h4-blue {\n        color: var(--link-hover);\n      }\n      h5,\n      h6 {\n        font-weight: normal;\n        font-variant-numeric: tabular-nums;\n        line-height: 1.1;\n      }\n      ul {\n        color: var(--text-1);\n      }\n      li {\n        color: var(--text-1);\n      }\n      p {\n        color: var(--text-1);\n        font-size: 1em;\n        /* padding-bottom: 1em; */\n      }\n      :is(h1, h2, h3, h4, h5, h6, p) {\n        margin: 1rem 0.1rem;\n      }\n\n      label {\n        margin: 0.5rem 0.1rem;\n      }\n\n      :is(h1, h2, h3, h4, h5, h6, p, label):first-child {\n        margin-top: 0;\n      }\n\n      :is(h1, h2, h3, h4, h5, h6, p, label):last-child {\n        margin-bottom: 0;\n      }\n\n      a {\n        color: var(--link);\n      }\n\n      a:hover {\n        color: var(--link-hover);\n      }\n\n      a:active {\n        color: var(--link-active);\n      }\n\n      label {\n        display: flex;\n        gap: 0.5rem;\n        align-items: center;\n      }\n\n      label input {\n        margin: 0;\n      }\n\n      button,\n      input,\n      select {\n        font-family: inherit;\n        font-size: inherit;\n      }\n\n      button {\n        background: var(--link);\n        color: var(--bg-1);\n        padding: 0.5rem 1rem;\n        border: none;\n        border-radius: var(--border-radius);\n      }\n\n      button:hover {\n        background: var(--link-hover);\n      }\n\n      button:active {\n        background: var(--link-active);\n      }\n\n      :is(button, button:hover, button:active):disabled {\n        background: var(--link);\n        filter: grayscale(1);\n        opacity: 0.4;\n      }\n\n      input,\n      textarea,\n      select {\n        padding: 0.5rem;\n        border: 1px solid var(--bg-2);\n        border-radius: var(--border-radius);\n        box-sizing: border-box;\n      }\n\n      input,\n      textarea {\n        background: var(--bg-1);\n        color: inherit;\n      }\n\n      select:not([multiple]) {\n        background: var(--bg-2);\n      }\n\n      textarea {\n        font-family: var(--font-mono);\n        font-size: 0.9rem;\n      }\n\n      form {\n        display: flex;\n        flex-direction: column;\n        gap: 1rem;\n        align-items: baseline;\n      }\n\n      ul:has(li):has(form) {\n        list-style: none;\n        padding: 0;\n      }\n\n      li form {\n        flex-direction: row;\n        gap: 0.5rem;\n        margin: 0.5rem 0;\n      }\n\n      nav {\n        position: relative;\n        display: flex;\n        gap: 1em;\n        padding-bottom: 2em;\n        background: var(--bg-2);\n        z-index: 2;\n        margin: 0 0 1em 0;\n        border-radius: 5;\n        background-color: var(--bg-1);\n      }\n\n      nav a {\n        text-decoration: none;\n      }\n\n      nav a[aria-current="true"] {\n        border-bottom: 2px solid;\n      }\n\n      ul:has(form) {\n        list-style: none;\n        padding: 0;\n      }\n\n      progress {\n        margin: 0.5rem 0;\n      }\n\n      progress:first-child {\n        margin-top: 0;\n      }\n\n      progress:lsat-child {\n        margin-bottom: 0;\n      }\n\n      .error {\n        color: red;\n      }\n\n      code {\n        background: var(--bg-2);\n        font-family: var(--font-mono);\n        font-size: 0.9em;\n        padding: 0.15rem 0.3rem;\n        border-radius: var(--border-radius);\n      }\n\n      ul.todos {\n        padding: 0;\n      }\n\n      ul.todos li:not(:has(> form)),\n      ul.todos li form {\n        position: relative;\n        display: flex;\n        align-items: center;\n        padding: 0.5em 0.5em 0.5em 1em;\n        margin: 0 0 0.5em 0;\n        gap: 0.5em;\n        border-radius: 5px;\n        user-select: none;\n        background: var(--bg-1);\n        filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.1));\n        transition: filter 0.2s, opacity 0.2s;\n      }\n\n      ul.todos .done {\n        filter: none;\n        opacity: 0.4;\n      }\n\n      ul.todos button {\n        border: none;\n        background-color: transparent;\n        background-repeat: no-repeat;\n        background-position: 50% 50%;\n        background-size: 1rem 1rem;\n        cursor: pointer;\n        width: 3em;\n        height: 3em;\n        margin: -0.5em -0.5em -0.5em 0;\n        aspect-ratio: 1;\n        opacity: 0.5;\n        transition: opacity 0.2s;\n      }\n\n      ul.todos button:hover {\n        opacity: 1;\n      }\n\n      body.dark {\n        --bg-1: hsl(0, 0%, 18%);\n        --bg-2: hsl(0, 0%, 30%);\n        --bg-3: hsl(0, 0%, 40%);\n        --fg-1: hsl(0, 0%, 90%);\n        --fg-2: hsl(0, 0%, 70%);\n        --fg-3: hsl(0, 0%, 60%);\n        --link: hsl(206, 96%, 72%);\n        --link-hover: hsl(206, 96%, 78%);\n        --link-active: hsl(206, 96%, 64%);\n        margin: -0.5em -0.5em -0.5em 0;\n      }\n    </style>\n  </head>\n  <body>\n    <div style="display: contents">' + body + '</div>\n\n    <script>\n      const theme = new URL(window.location).searchParams.get("theme");\n\n      document.body.classList.remove("light", "dark");\n      document.body.classList.add(theme || "light");\n    <\/script>\n  </body>\n</html>\n',
    error: ({ status, message }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' + message + `</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">` + status + '</span>\n			<div class="message">\n				<h1>' + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n"
  },
  version_hash: "1f9y8ah"
};
async function get_hooks() {
  let handle;
  let handleFetch;
  let handleError;
  let handleValidationError;
  let init;
  let reroute;
  let transport;
  return {
    handle,
    handleFetch,
    handleError,
    handleValidationError,
    init,
    reroute,
    transport
  };
}
export {
  set_public_env as a,
  set_read_implementation as b,
  set_manifest as c,
  get_hooks as g,
  options as o,
  public_env as p,
  read_implementation as r,
  set_private_env as s
};
