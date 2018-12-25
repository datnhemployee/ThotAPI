const toError = (className,functionName,error) => 
      '\nError: { '+
      '\nClass: '+ className +
      '\nFunction: '+ functionName + 
      '\nDetail: '+ error;
      '\n}';

module.exports = {
  toError,
}