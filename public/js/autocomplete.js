   $(function(){
    $("#search").autocomplete({
      source: function (req, res){
        $.ajax({
          url: "/autocomplete",
          dataType: "jsonp",
          type: "GET",
          data: req,
          success: function(data){
            res(data)
            console.log(data)
          },
          error: function(err){
            console.log(err.status)
          }
        })
      },
      minLength: 1,
      select: function(event, ui){
        if(ui.item){
          $("#search").text(ui.item.label)
          console.log(ui.item)
        }
      }
    })
   })