class ErrorTag extends Error {
	tag: string;
	constructor(message, tag) {
		super(message);
		this.tag = tag;
	}
}

export default ErrorTag;
