import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
	eleventyConfig.addLayoutAlias("blog", "blog.njk");
	eleventyConfig.addLayoutAlias("blogpost", "blogpost.njk");
	eleventyConfig.addPassthroughCopy("./imgs");
	eleventyConfig.addPassthroughCopy("./css");
	eleventyConfig.addPassthroughCopy("./favicon.png");
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.addFilter(
		"prettyDate",
		(date) =>
			date?.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}) || "Unknown date"
	);
}
