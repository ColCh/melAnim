    var constants = {};

    var directions = constants["directions"] = {};

    var DIRECTION_NORMAL = directions["normal"] = changeRadix.binToDec("00");
    var DIRECTION_REVERSE = directions["reverse"] = changeRadix.binToDec("01");
    var DIRECTION_ALTERNATE = directions["alternate"] = changeRadix.binToDec("10");
    var DIRECTION_ALTERNATE_REVERSE = directions["alternate-reverse"] = changeRadix.binToDec("11");

    var fillmodes = constants["fillModes"] = {};

    var FILLMODE_NONE = fillmodes["none"] = changeRadix.binToDec("00");
    var FILLMODE_FORWARDS = fillmodes["forwards"] = changeRadix.binToDec("01");
    var FILLMODE_BACKWARDS = fillmodes["backwards"] = changeRadix.binToDec("10");
    var FILLMODE_BOTH = fillmodes["both"] = changeRadix.binToDec("11");

    var playstates = constants["playStates"] = {};

    var PLAYSTATE_RUNNING = playstates["running"] = changeRadix.binToDec("0");
    var PLAYSTATE_PAUSED = playstates["paused"] = changeRadix.binToDec("1");