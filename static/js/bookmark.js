$(function(){
    $('noscript').remove()
    $('script').remove()

    $text = escape($('#rightcolumn').html())
    document.body.innerHTML += '<form id="dynForm" action="http://bbs.eee.upd.edu.ph/iskotool" method="post"><input type="hidden" name="bookmark" value='+$text+'></form>';
    document.getElementById("dynForm").submit();
})

/*
javascript:if(String(window.location).substr(0,33)=='https://crs.upd.edu.ph/viewgrades')$.getScript('http://localhost:8000/iskotool/static/js/bookmark.js');else alert('You must be at https://crs.upd.edu.ph/viewgrades to use this.');

*/
