$(document).ready(function(){
    $('.accord').click(function(){
        var menu = $(this).attr("href");
        $(menu).slideToggle();
    })
    
    $('.btn-tab-toggle').click(function(){
        var menu=$(this).attr("href");
        $("."+menu).slideToggle("fast");
        $(menu+" .linkmore").toggle(180);
        if ($("."+menu).height() > 20) {
            $(this).css({
                "-webkit-transform" : "rotate(180deg)",
                "-moz-transform" : "rotate(180deg)",
                "transform" : "rotate(180deg)"
            })
            $('#'+menu).hide();
        }else if($("."+menu).height() < 20){
            $(this).css({
                "-webkit-transform" : "rotate(0deg)",
                "-moz-transform" : "rotate(0deg)",
                "transform" : "rotate(0deg)"
            })
        }
    });
})