var weekView = true;
var transition = false;
PrettyCalendar.UNDEFINED_TIME = -2;
PrettyCalendar.prototype.wrappingDiv;

function PrettyCalendar(events, divToPut, navigation, customLabels){
	if(typeof navigation == 'undefined') navigation = false;
	if(typeof customLabels == 'undefined') {
		var weekday=new Array(7);
		weekday[0]="Sunday";
		weekday[1]="Monday";
		weekday[2]="Tuesday";
		weekday[3]="Wednesday";
		weekday[4]="Thursday";
		weekday[5]="Friday";
		weekday[6]="Saturday";
		customLabels = weekday;
	}
	this.wrappingDiv = divToPut;
	this.genCalendar(customLabels);
	if (navigation){
		PrettyCalendar.addNavigation();
	}
	initTransitions();
	PrettyCalendar.commitEvents(events);
}

PrettyCalendar.arrangeInDays = function(events) {
    var eventsToday = [];
    for (var i = 0; i < 7; i++) eventsToday[i] = [];
    for (var i = 0; i < events.length; i++) {
        var dayToArrange = 0;
        switch (events[i][0].toLowerCase()) {
        case "sunday":
            dayToArrange = 0;
            break;
        case "monday":
            dayToArrange = 1;
            break;
        case "tuesday":
            dayToArrange = 2;
            break;
        case "wednesday":
            dayToArrange = 3;
            break;
        case "thursday":
            dayToArrange = 4;
            break;
        case "friday":
            dayToArrange = 5;
            break;
        case "saturday":
            dayToArrange = 6;
            break;
        }
        var tempIndex = eventsToday[dayToArrange].length;
        eventsToday[dayToArrange][tempIndex] = [];
        eventsToday[dayToArrange][tempIndex][0] = events[i][1];
        eventsToday[dayToArrange][tempIndex][1] = events[i][2];
        eventsToday[dayToArrange][tempIndex][2] = events[i][3];
    }
    return eventsToday;
}

PrettyCalendar.prototype.genCalendar = function(customLabels) {
    $("#"+this.wrappingDiv).css("font-family","Tahoma,Arial,sans-serif");
    $("#"+this.wrappingDiv).css("overflow-x", "hidden");
    $("#"+this.wrappingDiv).css("overflow-y", "hidden");
    $("#"+this.wrappingDiv).css("min-width", "760px");
    $("#"+this.wrappingDiv).css("min-height", "500px");
    var wrapperDiv = document.createElement("div");
    $(wrapperDiv).attr("id", "wrapper");
    var calendarDiv = document.createElement("div");
    $(calendarDiv).attr("id", "calendar");
    var sidebarDiv = document.createElement("div");
    $(sidebarDiv).attr("id", "sidebar");
    for (var i = 0; i < 12; i++) {
        var timeLabelDiv = document.createElement("div");
        $(timeLabelDiv).attr("class", "timeLabel");
        var textLabel = "12";
        if (i > 0) textLabel = i * 2 - (12 * (i > 6));
        if (i < 6) textLabel += "am";
        else textLabel += "pm";
        $(timeLabelDiv).text(textLabel);
        sidebarDiv.appendChild(timeLabelDiv);
    }
    for (var i = 0; i < 7; i++) {
        var dayDiv = document.createElement("div");
        $(dayDiv).attr("id", "day" + (i + 1));
        $(dayDiv).attr("class", "day");
        var dayLabel = document.createElement("div");
        $(dayLabel).attr("class", "dayName sep");
        var dayLabelText = "Sunday";
		dayLabelText = customLabels[i];
        $(dayLabel).text(dayLabelText);
        dayDiv.appendChild(dayLabel);
        for (var j = 0; j < 23; j++) {
            var tempDiv = document.createElement("div");
            $(tempDiv).attr("class", "sep");
            dayDiv.appendChild(tempDiv);
        }
        calendarDiv.appendChild(dayDiv);
    }
    wrapperDiv.appendChild(sidebarDiv);
    wrapperDiv.appendChild(calendarDiv);
    document.getElementById(this.wrappingDiv).appendChild(wrapperDiv);
}

PrettyCalendar.timeToHours = function(formatted) {
    var timeHours = 0;
    var timeWithLabel = formatted[0];
    if (timeWithLabel.replace("pm", "") != timeWithLabel) timeHours += 12;
    var twoPieces = timeWithLabel.split(":");
    if (twoPieces[0] == "12") timeHours -= 12;
    timeHours = Number(timeHours) + Number(twoPieces[0]);
    timeHours = Number(timeHours) + Number(twoPieces[1].replace("am", "").replace("pm", "")) / 60;
    return timeHours;
}

PrettyCalendar.populateEvents = function(eventsToday) {
    var counterTemp = 0;
    for (var j = 0; j < 7; j++) {
        var lastTime = PrettyCalendar.UNDEFINED_TIME;
        var numToCompress = 1;
        if (eventsToday[j].length != 0) {
            eventsToday[j] = eventsToday[j].sort(function(a, b) {
                return PrettyCalendar.timeToHours(a) - PrettyCalendar.timeToHours(b);
            });
        }
        for (var i = 0; i < eventsToday[j].length; i++) {
            counterTemp++;
            var timeHours = PrettyCalendar.timeToHours(eventsToday[j][i]);
            if (timeHours - lastTime < 1.2) {
                numToCompress++;
            } else {
                numToCompress = 1;
            }
            lastTime = timeHours;
            var formatWidth = 100 / numToCompress;
            var eventTempDiv = document.createElement("div");
            $(eventTempDiv).attr("class", "event");
            $(eventTempDiv).attr("id", "event" + (counterTemp));
            var percentTemp = (100 * timeHours / 24) + 4.16;
            $(eventTempDiv).attr("style", "top:" + percentTemp + "%;width:" + formatWidth + "%;background-color:" + eventsToday[j][i][2] + ";left:" + (100 - formatWidth) + "%;");
            if (formatWidth != 100) {
                for (var x = 0; x < numToCompress - 1; x++) {
                    $("#event" + (counterTemp - (x + 1))).css("width", formatWidth + "%");
                    $("#event" + (counterTemp - (x + 1))).css("left", (100 - formatWidth * (x + 2)) + "%");
                }
            }
            $(eventTempDiv).text(eventsToday[j][i][1]);
            $("#day" + (j + 1)).append(eventTempDiv);
        }
    }
}

function initTransitions() {
    $(".day").click(function() {
        if (!transition) {
            if (weekView) {
                transition = true;
                weekView = false;
                $("#day7").not(this).css("width", "13%");
                $("#day1").not(this).css("width", "13%");
                $(".day").not(this).css("min-width", "0px");
                $(".day").not(this).animate({
                    width: "0%",
                }, 1000, function() {
                    $(".day").not(this).css("display", "none");
                });
                $(this).animate({
                    width: "100%",
                }, 1000, function() {
                    $(this).css("display", "block");
                    transition = false;
                });
            } else {
                transition = true;
                $(".day").css("display", "block");
                weekView = true;
                $(".day").not(this).animate({
                    width: "14.28%",
                }, 1000, function() {
                    $(".day").css("min-width", "100px");
                    transition = false;
                });
                $(this).animate({
                    width: "14.28%",
                }, 970);
                    
            }
        }
    });
}

PrettyCalendar.prototype.addFooter = function(footerContents) {
    var footer = document.createElement("footer");
    $(footer).html(footerContents);
    document.getElementById(this.wrappingDiv).appendChild(footer);
}

PrettyCalendar.addNavigation = function() {
	var leftNavBtn = '<div class="directionNav" onclick="leftNav()"><span class="directionLabel">&lt;</span></div>';
	var rightNavBtn = '<div class="directionNav" onclick="rightNav()" style="left:95%;"><span class="directionLabel">&gt;</span></div>';
	$("#wrapper").append(leftNavBtn+rightNavBtn);
}

PrettyCalendar.commitEvents = function(events){
	events = PrettyCalendar.arrangeInDays(events);
	PrettyCalendar.populateEvents(events);
}
