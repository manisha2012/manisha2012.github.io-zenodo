var uploadDataOnZenodo = function (uploadedData) {
    $("#upload_figshare_div").hide();
    var progBarObj = $("#zenodo_progress_bar");
    var progBarDivObj = $("#zenodo_progress_bar_div");
    progBarDivObj.removeClass('hide')
    var zenodo_token = uploadedData.access_token;
    var articleData = {
        'metadata': {
            'title': uploadedData.title,
            'upload_type': uploadedData.upload_type,
            'description': uploadedData.description
        }
    };

    (function( $, zenodo_token, uploadedData, progBarObj, articleData) {
        "use strict";
        progBarObj.progressbar({ value: 0 });
        $.when(
            $.ajax({
                type: "POST",
                url :  'https://zenodo.org/api/deposit/depositions',
                data : JSON.stringify(articleData),
                beforeSend: function (xhr){
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader('Authorization', 'Bearer ' + zenodo_token);
                },
            })
                .done( function( depositionData ) {
                    console.log("deposition data");
                    var deposition_id = depositionData['id'];
                    var fd = new FormData();
                    fd.append( 'file', uploadedData.file);
                    $.ajax
                    ({
                        type: "POST",
                        url: "https://zenodo.org/api/deposit/depositions/" + deposition_id + "/files",
                        data: fd,
                        processData: false,
                        contentType: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + zenodo_token);
                        },
                        progress: function(e) {
                          console.log("e :", e);
                            if(e.lengthComputable) {
                                var pct = (e.loaded / e.total) * 100;
                                console.log("pct :", pct);
                                progBarObj
                                    .progressbar('option', 'value', pct)
                                    .children('.ui-progressbar-value').css('background', 'rgb(43,194,83)')
                                    .html(pct.toPrecision(3) + '%')
                                    .css('display', 'block');
                            } else {
                                console.warn('Content Length not reported!');
                            }
                        }
                    })
                        .done(function (data) {
                            console.log("zenodo file location :", data);
                            progBarDivObj.addClass('hide');
                            $("#zenodo_upload_success").removeClass('hide');
                            //$('#upload_figshare_div').find('input').val('');
                            //$("#upload_figshare_div").show();
                            //showUploadedZenodoFile(depositionData);
                        })
                        .fail( function( reason ) {
                            console.info("file upload failed :", reason );

                        })
                })
                .fail( function( reason ) {
                    console.info("article creation failed :", reason );

                })
              )
            .then(
                // Success
                function( response ) {
                    // Has been successful
                    // In case of more then one request, both have to be successful
                    console.log("zenodo response :", response);
                },
                // Fail
                function( error ) {
                    // Has thrown an error
                    // in case of multiple errors, it throws the first one
                    console.log("error :", error);
                    progBarDivObj.addClass('hide');
                    $("#zenodo_upload_fail").removeClass('hide');
                    $("#zenodo_upload_fail").find('p').html(error.responseJSON.message);
                },
            );
    } )( jQuery, zenodo_token, uploadedData, progBarObj, articleData || {} );
};

$(document).ready(function () {
  access_token = '';
  $("#submit_access_token").on('click', function(e) {
    e.preventDefault();
    access_token = $("#access_token").val();
    if(access_token) {
      $("#access_token").val('');
      $("#upload_figshare_div").removeClass('hide');
    }
  });

  $("#upload_to_zenodo").on('click', function(e) {
    e.preventDefault();
    var title = $("#article_title").val();
    var description = $("#article_description").val();
    var file = $('#uploaded_file')[0].files[0];
    console.log(title, description, file);
    if(title && description && file) {
      console.log("yes");
      if(confirm("Once uploaded the data will be submitted to Zenodo. You can make changes and publish it later. Are you sure you want to continue?")) {
        uploadDataOnZenodo({
            file:file,
            upload_type:'dataset',
            title:title,
            description:description,
            access_token:access_token
        });
      }
    }
  });
});
