declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: { readonly [key: string]: string } | string;
  export default content;
}

declare module "*.scss" {
  const content: { readonly [key: string]: string } | string;
  export default content;
}
