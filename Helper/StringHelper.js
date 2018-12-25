const WHITE_SPACE = new RegExp('\\s');
const NOT_WORDS_AND_DIGITS_ONLY = new RegExp('\\W');

const isString = (val) => {
  if(typeof val === 'string'){
    return true;
  }
  return false;
}

const getRandomString = (length = 10) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

const isEmpty = (val) => {
  try{
    if(val.length)
      return true;
  } catch (err){
    console.log(err);
  }
  return false;
}

const hasWordsAndDigitOnly = (val) => {
  try{
    return !NOT_WORDS_AND_DIGITS_ONLY.test(val);
  } catch (err){
    console.log(err);
  }
  return false;
}

const hasNoWhiteSpace = (val) => {
  try{
    return !WHITE_SPACE.test(val);
  } catch (err){
    console.log(err);
  }
  return false;
}

const isRegularExpression = (val) => {
  try{
    return isString(val) &&
      isEmpty(val) &&
      hasWordsAndDigitOnly(val) &&
      hasNoWhiteSpace(val);
  } catch (err){
    console.log(err);
  }
  return false;
}

module.exports = {
  isRegularExpression,
  isString,
  isEmpty,
  hasNoWhiteSpace,
  hasWordsAndDigitOnly,
  getRandomString,
}
