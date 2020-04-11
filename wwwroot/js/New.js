function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#imagePreview').attr('src', e.target.result);
            $('#imagePreview').show();
        };

        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
}

$("#imageFile").change(function () {
    readURL(this);
});

function loadGiphy(type) {

    var title = $("#title").val();
    //var apiKey = $("#giphyApiKey").val();

    //$.get("https://api.giphy.com/v1/" + type + "s/random",
    //    {
    //        api_key: apiKey,
    //        tag: title
    //    })
    //    .done(function (result) {
    //        var giphyUrl = result.data.images["original"].mp4;
    //        $("#giphySource").attr("src", giphyUrl);
    //        var video = $("#giphy");
    //        video.show();
    //        video[0].load(giphyUrl);
    //        video[0].play();

    //        $("#giphyUrl").val(giphyUrl);
    //    });

    $.get("/api/Giphy/GetRandom" + type,
        {
            searchParameter: title
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

$(document).ready(function () {
    $("#giphyButton").click(getGiphy);
    $("#stickerButton").click(getSticker);
    $("#imageUrl").change(function () {
        $("#giphyUrl").val($("#imageUrl").val());
    });
});