function getFridayDate() {
    var fridayDate = new Date();
    console.log(fridayDate.toISOString());
    console.log(fridayDate.getDate());
    if (fridayDate.getDay() != 5) {
        fridayDate.setDate(fridayDate.getDate() + (((fridayDate.getDay() + 2) % 7) * (-1)));
    }

    /* Calculation mapping
     * 0 -> -2
     * 1 -> -3
     * 2 -> -4
     * 3 -> -5
     * 4 -> -6
     * 5 --- Mean Friday, handled in condition above.
     * 6 -> -1
     */
    return fridayDate.toISOString().replace(/T.*/, '');
}

console.log(getFridayDate());