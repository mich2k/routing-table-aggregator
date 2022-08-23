let recordNo = 0;

var inputDicList = [];

function crossCheckIntegrityListLen() {
  let actualTableLen = $(".t-row").length;
  actualTableLen === recordNo
    ? null
    : () => {
        console.log("!table length inconsistency, fixing..");
        recordNo = actualTableLen;
      };
}

function decToBin(ip) {
  let ipList = ip.split(".");
  ipList = ipList.map((oct) => {
    let bin = parseInt(oct).toString(2);
    return "00000000".substring(bin.length) + bin; // padding with zeros
  });
  return ipList;
}

function fillList(param) {
  param = [];
  for (let i = 1; i <= recordNo; ++i) {
    param.push({ id: i, ip: $("#ip-" + i).val(), nm_cidr: $("#cidr-" + i).val(), next_hop: $("#nh-" + i).val() });
  }
  return param;
}

function isInputValid() {
  // N rules Validation > 1
  crossCheckIntegrityListLen();

  let tmpDicArr = [];

  if (recordNo < 2) {
    alert("You can not aggregate a routing table with only one record");
    return false;
  }

  tmpDicArr = fillList();

  for (let i = 0; i < tmpDicArr.length; i++) {
    let curr_ip = tmpDicArr[i].ip,
      curr_nm_cidr = tmpDicArr[i].nm_cidr,
      curr_next_hop = tmpDicArr[i].next_hop;

    let whitespace_rgx = /\s/g.test(curr_ip) || /\s/g.test(curr_nm_cidr) || /\s/g.test(curr_next_hop);
    if (whitespace_rgx) {
      alert("No whitespaces allowed.");
      return whitespace_rgx;
    }

    let is_any_null = curr_ip == "" ? true : curr_nm_cidr == "" ? true : curr_next_hop == "" ? true : false;
    if (is_any_null) {
      alert("No empty fields allowed.");
      return is_any_null;
    }
  }

  // IP Validation
  // SM Validation
  // NH Validation
  // N rules with same hop Validation
  return true;
}

function addRecord() {
  crossCheckIntegrityListLen();

  recordNo++;
  rt_markup =
    `
  <tr id="row-` +
    recordNo +
    `>
  <th " class="t-row" scope="row">` +
    recordNo +
    `</th>
    <td> ` +
    recordNo +
    ` </td>
  <td><input type="text" max="12" name="" id="ip-` +
    recordNo +
    `" /></td>
  <td>
      / <input class="col-2" maxlength="2" type="text" name="" id="cidr-` +
    recordNo +
    `" />
  </td>
  <td><input type="text" name="" id="nh-` +
    recordNo +
    `" /></td>
</tr>
  `;
  tableBody = $("#routing-table-body");
  tableBody.append(rt_markup);
  recordNo = $(".t-row").length;
}

function delRecord() {
  crossCheckIntegrityListLen();
  if (recordNo < 2) {
    alert("Is not possible to remove futher rows.");
    return;
  }
  $("#routing-table tr:last").remove();
  recordNo--;
  crossCheckIntegrityListLen();
}

function cidrToBinaryBitmask(cidr) {
  let mask = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
  for (let j = 0; j < cidr; j++) mask[j] = "1";
  return mask.join("");
}

function binToDec(ip) {
  // ip = [11111111,11111111,11111111,11111111]
  ip = ip.map((oct) => {
    return parseInt(oct, 2).toString(10);
  });
  return ip;
}

function mainCalculate() {
  function addResRecord() {
    crossCheckIntegrityListLen();
    rt_markup =
      `
    <tr id="res-row-` +
      recordNo +
      `>
    <th " class="t-row" scope="row">` +
      recordNo +
      `</th>
      <td> ` +
      recordNo +
      ` </td>
    <td>
    <input class="form-control" type="text" placeholder="` +
      resOutDecIp +
      `" readonly="">
      </td>
    <td>
        / <input class="col-2" maxlength="2" type="text" name="" id="res-cidr-` +
      recordNo +
      `" readonly>
    </td>
  </tr>
    `;
    tableBody = $("#res-table-body");
    tableBody.append(rt_markup);
    // recordNo = $(".t-row").length;
  }

  crossCheckIntegrityListLen();
  let binDicList = [];

  function buildBinDictionary() {
    // abstract this
    for (let i = 0; i < recordNo; i++) {
      let binIp = decToBin(inputDicList[i].ip);
      binDicList.push({
        id: i + 1,
        bin_ip: binIp,
        bin_nm: cidrToBinaryBitmask(inputDicList[i].nm_cidr),
        next_hop: inputDicList[i].next_hop,
      });
    }
  }

  function commonNextHop() {
    /*
    JSON structure: {key: [values], key: [values]}
    where key is the next hop address and 
    values are all the IDs of IPs that match that next hop address
    */
    crossCheckIntegrityListLen();
    let cmnHopsGroupedBy = {};
    let nextHop;
    for (let i = 0; i < recordNo; i++) {
      nextHop = inputDicList[i].next_hop;
      cmnHopsGroupedBy[nextHop] = [];
    }
    for (let i = 0; i < recordNo; i++) {
      nextHop = inputDicList[i].next_hop;

      if (cmnHopsGroupedBy[nextHop].includes(i)) {
        continue;
      }
      cmnHopsGroupedBy[nextHop].push(i);
    }
    return cmnHopsGroupedBy;
  }

  function supernetCalculator() {
    // Object.values(dic)[0]
    // Object.keys(dic)[0]
    const keys = Object.keys(cmnHops);
    const n_common_hops_found = keys.length;
    let outDicList = [];
    console.log(n_common_hops_found);
    for (let i = 0; i < n_common_hops_found; i++) {
      let resOutBinIp = []; // resultant IP address, split in 8 bits in 4 groups/octets
      for (let j = 0; j < cmnHops[keys[i]].length; j++) {
        outDicList[j] = binDicList[cmnHops[keys[i]][j]];
        console.log(i + "," + j + ":  " + JSON.stringify(outDicList[j]));
        if (j == 0) {
          resOutBinIp = outDicList[j].bin_ip;
          continue;
        }
        for (let k = 0; k < 4; k++) {
          // one each octet
          resOutBinIp[k] &= outDicList[j].bin_ip[k];
        }
      }
      // console.log(i + " " + resOutBinIp);
      resOutDecIp = binToDec(resOutBinIp);

      if (resOutDecIp.length != 0) {
        $("#res-table").show();
      }

      addResRecord(resOutDecIp.join("."));
    }
  }

  buildBinDictionary();

  let cmnHops = commonNextHop();

  supernetCalculator();

  // console.dir(JSON.stringify(cmnHops));
}

$(function () {
  $("#res-table").hide();
  addRecord();
  $("#add-record-btn").on("click", function () {
    addRecord();
  });
  $("#del-record-btn").on("click", function () {
    delRecord();
  });
  $("#submit-btn").on("click", function () {
    try {
      /*if(!isInputValid()){
        console.log("Invalid input.");
      } // TO-DO*/
    } catch (e) {
      alert("Undefined error");
      console.dir(e);
    }
    crossCheckIntegrityListLen();
    inputDicList = fillList();
    console.log(inputDicList);
    mainCalculate();
  });
});
