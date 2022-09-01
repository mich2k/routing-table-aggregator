import $ from "jquery";
import { RoutingTable } from "./classes/RoutingTable";

$(function () {
  $("#test").append("test");
  const table = new RoutingTable(0);
});
