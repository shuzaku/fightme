import Vue from 'vue';

Vue.filter('commaDelimited', function(x) {
    x = x || 0;

    var parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
});

Vue.filter('twoDecimalPlaces', function(x) {
    x = parseFloat(x || 0);

    return x.toFixed(2);
});

Vue.filter('roundedCurrency', function(x) {
    x = x || 0;

    x = Math.round(x);
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return '$' + x;
});

Vue.filter('currency', function(x) {
    x = x || 0;
    x = parseFloat(x);
    x = x.toFixed(2);

    var parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts[1][0] == '0' && parts[1][1] == '0') {
        x = '$' + parts[0];
    }
    else {
        x = '$' + parts.join('.');
    }

    return x;
});

Vue.filter('currencyTwoDecimals', function(x) {
    x = x || 0;
    x = parseFloat(x);
    const isNegative = x < 0;
    x = Math.abs(x).toFixed(2);

    var parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    x = '$' + parts.join('.');
    if (isNegative) {
        x = '-' + x;
    }
    return x;
});

Vue.filter('round', function(x) {
    x = x || 0;

    return Math.round(x);
});

Vue.filter('removeNullString', function(s) {
    if (s == 'null') {
        return '';
    }
    else {
        return s;
    }
});

Vue.filter('lowercase', function(s) {
    s = s || '';

    return s.toLowerCase();
});

Vue.filter('namePlaceholder', function(x) {
    x = x || '';
    x = x.trim();

    return x || 'No name';
});




Vue.filter('UpperCaseString', function(value) {
    return value.toUpperCase()
});

Vue.filter('time', function(t) {
    t = t || 0;

    var hours = Math.floor(t / 3600);
    var minutes = Math.floor((t - (hours * 3600)) / 60);
    var seconds = t - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }

    if (hours == '00') {
        return minutes + ':' + seconds;
    }
    else {
        return hours + ':' + minutes + ':' + seconds;
    }
});

Vue.filter('date', function(date) {
    if (date) {
        var day = date.getDate();       // yields date
        var month = date.getMonth() + 1;    // yields month (add one as '.getMonth()' is zero indexed)
        var year = date.getFullYear();  // yields year

        // var hour = date.getHours();     // yields hours
        // var minute = date.getMinutes(); // yields minutes
        // var second = date.getSeconds(); // yields seconds

        if (year != 1900) {
            return month + '/' + day + '/' + year;
        }
    }

    return '';
});

Vue.filter('momentDate', function(date) {
    if (date) {
        return date.local().format('MMM Do, YYYY [at] h:mm a');
    }

    return '';
});

Vue.filter('momentDateMMMDDYYYYtime', function(date) {
    if (date) {
        return date.local().format('MMM DD, YYYY [at] h:mm a');
    }

    return '';
});

Vue.filter('momentDateDaydddd', function(date) {
    if (date) {
        return date.local().format('dddd');
    }

    return '';
});

Vue.filter('momentTime', function(date) {
    if (date) {
        return date.local().format('h:mm A');
    }

    return '';
});

Vue.filter('momentWeekDay', function(date){
    if(date){
        return date.local().format('ddd')
    }
});

Vue.filter('momentDateMMMDoYYYY', function(date) {
    if (date) {
        return date.local().format('MMM Do, YYYY');
    }

    return '';
});

Vue.filter('momentDateMMDDYYYY', function(date) {
    if (date) {
        return date.local().format('MM/DD/YYYY');
    }

    return '';
});

Vue.filter('momentDateDDMMDoYYYY', function(date) {
    if (date) {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.local().format('MMM DD YYYY')}`;
    }
    return '';
});

Vue.filter('momentDateMMYY', function(date) {
    if (date) {
        return date.local().format('MM/YY');
    }
    return '';
});

Vue.filter('momentDateMMMDYYYY', function(date) {
    if (date) {
        return date.local().format('MMM D, YYYY');
    }

    return '';
});

Vue.filter('momentDateMMMMDYYYY', function(date) {
    if (date) {
        return date.local().format('MMMM D, YYYY');
    }

    return '';
});

Vue.filter('momentDateddddMMMMDDYYYY', function(date) {
    if (date) {
        return date.local().format('dddd, MMMM DD, YYYY');
    }

    return '';
});

Vue.filter('momentDatedddMMMMDDYYYY', function(date) {
    if (date) {
        return date.local().format('ddd, MMM DD, YYYY');
    }

    return '';
});

Vue.filter('momentDateFromNow', function(date, isAgoAdded = true) {
    if (date) {
        return date.local().fromNow(isAgoAdded);
    }

    return '';
});

Vue.filter('datetime', function(date) {
    if (date) {
        var year = date.getFullYear();  // yields year
        if (year != 1900) {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        }
    }

    return '';
});

Vue.filter('timeHHMM', function(date) {
    if (date) {
        var year = date.getFullYear();  // yields year
        if (year != 1900) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
        }
    }

    return '';
});

Vue.filter('stringDateToLongDate', function(date) {
    if (date) {
        var formattedDate = new Date(date);
        var year = formattedDate.getFullYear();  // yields year
        if (year != 1900) {
            return formattedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    return '';
});

Vue.filter('longDate', function(date) {
    if (date) {
        var year = date.getFullYear();  // yields year
        if (year != 1900) {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    return '';
});

Vue.filter('stringDateToShortDate', function(date) {
    if (date) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    }
    return '';
});

Vue.filter('stringShortWeekday', function(date) {
    if (date) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return '';
});


Vue.filter('defaultStatus', function(status) {
    if (status == null || status == '') {
        return 'Select Status';
    }

    return status;

});

Vue.filter('percentage', function(percent) {
    percent = percent * 100.0;
    percent = percent.toFixed(2);
    var parts = percent.toString().split('.');

    return parts[0] + '%';
});

Vue.filter('percentage1', function(percent) {
    percent = percent * 100.0;
    percent = percent.toFixed(1);

    return percent + '%';
});

Vue.filter('percentage2', function(percent) {
    percent = percent * 100.0;
    percent = percent.toFixed(2);

    return percent + '%';
});

Vue.filter('bytesToMegaBytes', function(bytes) {
    var megaBytes = 0;

    megaBytes = bytes / 1000000;
    megaBytes = megaBytes.toFixed(2);

    var splitSize = megaBytes.split('.');

    if (splitSize[1] == '00') {
        return splitSize[0] + 'MB';
    }
    else {
        return megaBytes + 'MB';
    }

});

Vue.filter('bytesToKiloBytes', function(bytes) {
    var kiloBytes = 0;

    kiloBytes = bytes / 1000;
    kiloBytes = kiloBytes.toFixed(2);

    var splitSize = kiloBytes.split('.');

    if (splitSize[0] == 0) {
        return '0.' + splitSize[1] + 'KB';
    }
    else {
        return kiloBytes + 'KB';
    }
});

Vue.filter('bytesToLargestUnit', function(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
        return 'N/A';
    }

    const i = parseInt(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)), 10);

    if (i === 0) {
        return `${bytes} ${sizes[i]}`;
    }
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
});

Vue.filter('secondsToDhms', function(seconds) {
        seconds = Number(seconds);

        if (seconds === 0) {
            return '0s'
        }

        var d = Math.floor(seconds / (3600*24));
        var h = Math.floor(seconds % (3600*24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);

        var dDisplay = d > 0 ? d + 'D' : '';
        var hDisplay = h > 0 ? h + 'h' : '';
        var mDisplay = m > 0 ? m + 'm' : '';
        var sDisplay = s > 0 ? s + 's' : '';

        return dDisplay + ' ' + hDisplay + ' ' + mDisplay + ' ' + sDisplay;
});

Vue.filter('linkToExternalSite', function(url) {
    if (url.length > 0 && !url.startsWith('http')) {
        return `https://${url}`;
    };
    return url;
});

Vue.filter('truncateText', (value, total, addEllipsis = true) => {
    let string = ''

    if (value && value.length > total) {
        string = value.slice(0, total - 1)
        string = addEllipsis ? `${string}...` : string
    } else {
        string = value
    }

    return string
})
