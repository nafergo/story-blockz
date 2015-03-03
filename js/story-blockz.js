$(function() {
    var i = Number(localStorage.getItem('block-counter')) + 1,
        j = 0,
        k,
        $form = $('#block-form'),
        $removeLink = $('#show-items li a'),
        $itemList = $('#show-items'),
        $editable = $('.editable'),
        $clearAll = $('#clear-all'),
        $newBlock = $('#block'),
        order = [],
        orderList;

    // Load block list
    orderList = localStorage.getItem('block-orders');
    
    orderList = orderList ? orderList.split(',') : [];
    
    for( j = 0, k = orderList.length; j < k; j++) {
        $itemList.append(
            "<li id='" + orderList[j] + "'>"
            + "<span class='editable'>" 
            + localStorage.getItem(orderList[j]) 
            + "</span> <a class='delete' href='#'>delete</a></li>"
        );
    }
        
    // Add block
    $form.submit(function(e) {
        e.preventDefault();
        $.publish('/add/', []);
    });

    // Remove block
    $itemList.delegate('a.delete', 'click', function(e) {
        var $this = $(this);
        
        e.preventDefault();
        $.publish('/remove/', [$this]);
    });
       
        
    // Sort block
    $itemList.sortable({
        revert: true,
        stop: function() {
            $.publish('/regenerate-list/', []);
        }
    });
    
    // Edit and save block
    $editable.inlineEdit({
        save: function(e, data) {
                var $this = $(this);
                localStorage.setItem(
                    $this.parent().attr("id"), data.value
                );
            }
    });

    // Clear all
    $clearAll.click(function(e) {
        e.preventDefault();
        $.publish('/clear-all/', []);
    });

    // Fade In and Fade Out the Remove link on hover
    $itemList.delegate('li', 'mouseover mouseout', function(event) {
        var $this = $(this).find('a');
        
        if(event.type === 'mouseover') {
            $this.stop(true, true).fadeIn();
        } else {
            $this.stop(true, true).fadeOut();
        }
    });
        
    // Subscribes
    $.subscribe('/add/', function() {
        if ($newBlock.val() !== "") {
            // Take the value of the input field and save it to localStorage
            localStorage.setItem( 
                "block-" + i, $newBlock.val() 
            );
            
            // Set the block max counter so on page refresh it keeps going up instead of reset
            localStorage.setItem('block-counter', i);
            
            // Append a new list item with the value of the new block list
            $itemList.append(
                "<li id='block-" + i + "'>"
                + "<span class='editable'>"
                + localStorage.getItem("block-" + i) 
                + " </span> <a class='delete' href='#'>delete</a></li>"
            );

            $.publish('/regenerate-list/', []);

            // Hide the new list, then fade it in for effects
            $("#block-" + i)
                .css('display', 'none')
                .fadeIn();
            
            // Empty the input field
            $newBlock.val("");
            
            i++;
        }
    });
    
    $.subscribe('/remove/', function($this) {
        var parentId = $this.parent().attr('id');
        
        // Remove block list from localStorage based on the id of the clicked parent element
        localStorage.removeItem(
            "'" + parentId + "'"
        );
        
        // Fade out the list item then remove from DOM
        $this.parent().fadeOut(function() { 
            $this.parent().remove();
            
            $.publish('/regenerate-list/', []);
        });
    });


    
    $.subscribe('/regenerate-list/', function() {
        var $blockItemLi = $('#show-items li');
        // Empty the order array
        order.length = 0;
        
        // Go through the list item, grab the ID then push into the array
        $blockItemLi.each(function() {
            var id = $(this).attr('id');
            order.push(id);
        });
        
        // Convert the array into string and save to localStorage
        localStorage.setItem(
            'block-orders', order.join(',')
        );
    });
    
    $.subscribe('/clear-all/', function() {
        var $blockListLi = $('#show-items li');
        
        order.length = 0;
        localStorage.clear();
        $blockListLi.remove();
    });
});
