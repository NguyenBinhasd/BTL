$(function() {

    if($('textarea#ta').length) {
        CKEDITOR.replace('ta');
        CKEDITOR.config.autoParagraph = false;
    } //tạo cái như word trên textarea

    $('a.confirmDeletion').on('click', function() {
        if(!confirm('Are you sure want to delete this?')) return false;
    });

    //sử dụng fancybox
    if($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }   

});

