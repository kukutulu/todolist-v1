// remember: exports = getDate --> call and you can active the function later
//         : exports = getDate() --> active it right away at the call

exports.getDate = getDate;
exports.getDay = getDay;

function getDate() {
  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  //let day = today.toLocaleDateString("vi-VN", options);
  return today.toLocaleDateString("en-UK", options);
}

function getDay() {
  const today = new Date();

  const options = {
    weekday: "long",
  };

  //let day = today.toLocaleDateString("vi-VN", options);
  return today.toLocaleDateString("en-UK", options);
}
