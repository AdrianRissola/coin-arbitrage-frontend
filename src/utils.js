export const pad = (stringNum) => {
    if(stringNum.includes(".")) {
      if(stringNum.split(".")[1].length===1) stringNum = stringNum.concat("0")
    }
    else stringNum = stringNum.concat(".00")
    return stringNum;
}

