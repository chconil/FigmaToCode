
export const objectName = (nodeid: string): string => {
	return "obj_"+nodeid.replace(/:/g, "_").replace(/;/g, "_");
};
