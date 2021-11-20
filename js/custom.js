function setAdultsAndRoom(){
    let adults =  $('#adults').val();
    let rooms =  $('#rooms').val();
    console.log(adults);
    console.log(rooms);
    if(adults>1 && rooms>1){
        $('#adults-and-room').val(adults + " adults | " + rooms + " rooms");
    }
    else if(adults==1){
        $('#adults-and-room').val(adults + " adult | " + rooms + " rooms");
    }
    else if(rooms==1){
        $('#adults-and-room').val(adults + " adults | " + rooms + " room");
    }
    else{
        $('#adults-and-room').val(adults + " adult | " + rooms + " room");
    }
}

function initDatePickers() {
    const $dateFrom = $("#date-from");
    $dateFrom.datepicker({
        minDate:0,
        dateFormat: 'dd/mm/yy'
    });
    const dateFrom = moment().toDate();
    $dateFrom.datepicker('setDate', dateFrom);

    const $dateTo = $("#date-to");
    $dateTo.datepicker({
        minDate:1,
        dateFormat: 'dd/mm/yy'
    });
    const dateTo = moment().add(1,'days').toDate();
    $dateTo.datepicker('setDate', dateTo);
}

function getDateRangeObject() {
    let dateFrom = $("#date-from").val();
    let dateTo = $("#date-to").val();

    dateFrom = moment(dateFrom).format('YYYY-MM-DD');
    dateTo = moment(dateTo).format('YYYY-MM-DD');
    return {
        'checkin': dateFrom,
        'checkout': dateTo,
    }
}

initDatePickers();
getDateRangeObject();