function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        var filename = input.files[0].name;

        if (input.files[0].size > 52428800) {
            alert("Uploaded files must be less than 50 Mb");
            input.value = '';
        }
        else {
            reader.onload = function (e) {            
                var ext = filename.substring(filename.lastIndexOf('.') + 1);
                var preview = '';

                var videoExtensions = ["GIF", "MIDI", "OGG", "AVI", "MP4", "WMV"];
                if (videoExtensions.includes(ext.toUpperCase())) {
                    preview = '#videoPreview';
                } else {
                    preview = '#imagePreview';
                }
                $(preview).attr('src', e.target.result);
                $(preview).show();
            };

            reader.readAsDataURL(input.files[0]); // convert to base64 string
        }
    }
}

$("#imageFile").change(function () {
    readURL(this);
});

function loadGiphy(type) {

    var search = $("#giphySearchParameter").val();
    $("#title").val(search);

    $.get("/api/Giphy/GetRandom" + type,
        {
            searchParameter: search
        })
        .done(function (giphyUrl) {
            $("#giphySource").attr("src", giphyUrl);
            var video = $("#giphy");
            video.show();
            video[0].load(giphyUrl);
            video[0].play();

            $("#giphyUrl").val(giphyUrl);
        });
}

function getGiphy() {
    loadGiphy("Gif");
}

function getSticker() {
    loadGiphy("Sticker");
}

function previewCut() {
    
}

$(document).ready(function () {
    $("#giphyButton").click(getGiphy);
    $("#stickerButton").click(getSticker);
    $("#imageUrl").change(function () {
        $("#giphyUrl").val($("#imageUrl").val());
    });
    $("#previewCut").click(previewCut);
});