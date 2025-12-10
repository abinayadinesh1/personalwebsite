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
    app: ({ head, body, assets, nonce, env }) => '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <link rel="icon" href="' + assets + '/favicon.png" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="color-scheme" content="dark light" />\n    <link rel="stylesheet" href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css">\n    <script src="https://unpkg.com/telescopic-text/lib/index.js"><\/script>\n    <link\n      href="https://unpkg.com/telescopic-text/lib/index.css"\n      rel="stylesheet"\n    />\n  \n    ' + head + `

    <style>
      body {
        --bg-1: #f6f3e1;
        --text-1: #490303;
        --bg-2: hsl(224, 100%, 11%);
        --bg-3: hsl(206, 20%, 80%);
        --fg-1: hsl(0, 0%, 0%);
        --fg-2: hsl(0, 0%, 20%);
        --fg-2: hsl(0, 0%, 30%);
        --link: #558f6d;
        --link-hover: #b4ebcb;
        --link-active: #b4ebcb;
        --line: #41413B;
        --border-radius: 4px;
        --font: 'BerkeleyMono', Garamond, serif;
        --font-extre: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        --font-mono: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo,
          Consolas, "DejaVu Sans Mono", monospace;
        background: var(--bg-1);
        color: var(--fg-1);
        font-family: var(--font);
        line-height: 1.5;
        margin: 1rem;
        height: calc(100vh - 2rem);
        align-items: center;
        justify-content: center;
        background-color: var(--bg-1);
        color: var(--text-1);
        margin-bottom: 2 rem;
      }

      navbar-h1 {
        font-size: 2rem;
        color: var(--text-1);
        background-color: var(--bg-1);
        align-items: center;
        justify-content: center;
      }
      blockquote {
        color: hsl(235, 100%, 50%);
        font-family: Georgia, "Times New Roman", Times, serif;
        font-size: 1 rem;
      }
      hr.solid {
        border-top: 3px solid #41413B;
      }

      h1 {
        color: var(--text-1);
        padding-bottom: 0em;
      }
      h2 {
        color: var(--text-1);
      }
      h3 {
        color: var(--text-1);
      }
      h4 {
        color: var(--text-1);
      }
      h4-blue {
        color: var(--link-hover);
      }
      h5,
      h6 {
        font-weight: normal;
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
      }
      ul {
        color: var(--text-1);
      }
      li {
        color: var(--text-1);
      }
      p {
        color: var(--text-1);
        font-size: 0.8em;
        /* padding-bottom: 1em; */
      }
      :is(h1, h2, h3, h4, h5, h6, p) {
        margin: 1rem 0.1rem;
      }

      label {
        margin: 0.5rem 0.1rem;
      }

      :is(h1, h2, h3, h4, h5, h6, p, label):first-child {
        margin-top: 0;
      }

      :is(h1, h2, h3, h4, h5, h6, p, label):last-child {
        margin-bottom: 0;
      }

      a {
        color: var(--link);
      }

      a:hover {
        color: var(--link-hover);
      }

      a:active {
        color: var(--link-active);
      }

      label {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      label input {
        margin: 0;
      }

      button,
      input,
      select {
        font-family: inherit;
        font-size: inherit;
      }

      button {
        background: var(--link);
        color: var(--bg-1);
        padding: 0.5rem 1rem;
        border: none;
        border-radius: var(--border-radius);
      }

      button:hover {
        background: var(--link-hover);
      }

      button:active {
        background: var(--link-active);
      }

      :is(button, button:hover, button:active):disabled {
        background: var(--link);
        filter: grayscale(1);
        opacity: 0.4;
      }

      input,
      textarea,
      select {
        padding: 0.5rem;
        border: 1px solid var(--bg-2);
        border-radius: var(--border-radius);
        box-sizing: border-box;
      }

      input,
      textarea {
        background: var(--bg-1);
        color: inherit;
      }

      select:not([multiple]) {
        background: var(--bg-2);
      }

      textarea {
        font-family: var(--font-mono);
        font-size: 0.9rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: baseline;
      }

      ul:has(li):has(form) {
        list-style: none;
        padding: 0;
      }

      li form {
        flex-direction: row;
        gap: 0.5rem;
        margin: 0.5rem 0;
      }

      nav {
        position: relative;
        display: flex;
        gap: 1em;
        padding-bottom: 2em;
        background: var(--bg-2);
        z-index: 2;
        margin: 0 0 1em 0;
        border-radius: 5;
        background-color: var(--bg-1);
      }

      nav a {
        text-decoration: none;
      }

      nav a[aria-current="true"] {
        border-bottom: 2px solid;
      }

      ul:has(form) {
        list-style: none;
        padding: 0;
      }

      progress {
        margin: 0.5rem 0;
      }

      progress:first-child {
        margin-top: 0;
      }

      progress:lsat-child {
        margin-bottom: 0;
      }

      .error {
        color: red;
      }

      code {
        background: var(--bg-2);
        font-family: var(--font-mono);
        font-size: 0.9em;
        padding: 0.15rem 0.3rem;
        border-radius: var(--border-radius);
      }

      ul.todos {
        padding: 0;
      }

      ul.todos li:not(:has(> form)),
      ul.todos li form {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0.5em 0.5em 0.5em 1em;
        margin: 0 0 0.5em 0;
        gap: 0.5em;
        border-radius: 5px;
        user-select: none;
        background: var(--bg-1);
        filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.1));
        transition: filter 0.2s, opacity 0.2s;
      }

      ul.todos .done {
        filter: none;
        opacity: 0.4;
      }

      ul.todos button {
        border: none;
        background-color: transparent;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-size: 1rem 1rem;
        cursor: pointer;
        width: 3em;
        height: 3em;
        margin: -0.5em -0.5em -0.5em 0;
        aspect-ratio: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
      }

      ul.todos button:hover {
        opacity: 1;
      }

      body.dark {
        --bg-1: hsl(0, 0%, 18%);
        --bg-2: hsl(0, 0%, 30%);
        --bg-3: hsl(0, 0%, 40%);
        --fg-1: hsl(0, 0%, 90%);
        --fg-2: hsl(0, 0%, 70%);
        --fg-3: hsl(0, 0%, 60%);
        --link: hsl(206, 96%, 72%);
        --link-hover: hsl(206, 96%, 78%);
        --link-active: hsl(206, 96%, 64%);
        margin: -0.5em -0.5em -0.5em 0;
      }
    </style>
  </head>
  <body>
    <div style="display: contents">` + body + '</div>\n\n    <script>\n      const theme = new URL(window.location).searchParams.get("theme");\n\n      document.body.classList.remove("light", "dark");\n      document.body.classList.add(theme || "light");\n    <\/script>\n  </body>\n</html>\n',
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
  version_hash: "wbq058"
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
