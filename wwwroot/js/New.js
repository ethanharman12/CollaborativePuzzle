function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        var filename = input.files[0].name;

        if (input.files[0].size > 10485760) {
            alert("Uploaded files must be less than 10 Mb");
            input.value = '';
        }
        else {
            reader.onload = function (e) {
                previewPuzzle(e.target.result, isVideo(filename));
            };

            reader.readAsDataURL(input.files[0]); // convert to base64 string
        }
    }
}

$("#imageFile").change(function () {
    readURL(this);
});

function isVideo(filename) {
    var ext = filename.substring(filename.lastIndexOf('.') + 1);
    var videoExtensions = ["GIF", "MIDI", "OGG", "AVI", "MP4", "WMV"];
    return videoExtensions.includes(ext.toUpperCase());
}

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

function previewPuzzle(source, filename) {
    var preview = '';

    if (isVideo(filename)) {
        preview = '#videoPreview';
    } else {
        preview = '#imagePreview';
    }
    $(preview).attr('src', source);
    $(preview).show();
}

$(document).ready(function () {
    $("#giphyButton").click(getGiphy);
    $("#stickerButton").click(getSticker);
    $("#linkUrl").change(function () {
        var filename = $("#linkUrl").val();
        previewPuzzle(filename, filename);
    });
    $("#previewCut").click(previewCut);
});