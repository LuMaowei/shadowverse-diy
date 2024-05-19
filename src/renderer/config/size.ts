const originalSize = {
  width: 1270,
  height: 715,
  paddingTop: 36,
  paddingBottom: 12,
  paddingX: 72,
  headerFontSize: 24,
  frameWidth: 380,
  frameHeight: 498,
  mainBorderHeight: 12,
  mainBorderMargin: 8,
  contentWidth: 680,
  contentHeight: 478,
  attrHeight: 64,
  attrFontSize: 24,
  fillHeight: 66,
  detailsUnderlineWidth: 64,
  footerFontSize: 18,
};

const ratio = originalSize.contentWidth / originalSize.contentHeight;

export { originalSize, ratio };
