function getFridayDate() {
    var fridayDate = new Date();

    /* Calculation mapping
     * 5 -> 0
     * 6 -> -1
     * 0 -> -2
     * 1 -> -3
     * 2 -> -4
     * 3 -> -5
     * 4 -> -6
     */
    // Calculate offset for last friday according to the mapping in above comment
    const offset = (((fridayDate.getUTCDay() + 2) % 7) * (-1));
    const newDate = fridayDate.getUTCDate() + offset;

    fridayDate.setUTCDate(newDate);
    return fridayDate.toISOString().replace(/T.*/, '');
}

function shouldExecuteManual() {
    const friday = 5; // Day of the week
    var date = new Date();

    // False if it's Friday and earlier than 4AM right now
    return (date.getUTCDay() != friday) || (date.getUTCHours() >= 4);
}

module.exports = { getFridayDate, shouldExecuteManual };