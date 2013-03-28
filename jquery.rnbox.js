(function() {
	 $.fn.extend({
		// You can selectable img list.
		rnbox: function(options) {
			var opts, self;
			self = $.fn.rnbox;
		 	opts = $.extend({}, self.default_options, options);
			if(opts.root == null || opts.root == "" || !opts.root){
				console.warn("required set value to 'root'")
			}
			self.template = self.getTemplateByWindowWidth(opts);
			self.embedStyle(opts.root);
			$(window).bind("resize",self.resizeHandler(opts));
			return $(this).each(function(i, el) {
				self.init(el, opts, i);
			});
		}
	 });
	$.extend($.fn.rnbox, {
		default_options: {
			template: "#template-rnbox",
			root: "" //rquired set root element
		},
		template: null,
		reservedListSelector: "siblings-list",
		opened: false,
		init: function(el, opts,id) {
			$(el).attr("data-rnbox-id","rnbox-item-"+id);
			var group = $(el).attr("data-rnbox-group");
			if(group == undefined){
				$(el).attr("data-rnbox-group",this.reservedListSelector);
			}
			$(el).click(this.clickHandler(opts));
		},
		clickHandler: function(opts){
			var that = this;
			return function (){
				that.drawTemplate(this,opts);
			}
		},
		getTemplateByWindowWidth: function(opts){
			var template;
			if(typeof opts.template == "string"){
				template = opts.template;
			}else{
				opts.template = opts.template.sort(function(e0,e1){
					return e0.over > e1.over
				});
				for(var i=0;i<opts.template.length;i++){
					var o = opts.template[i];
					if(o.over >= document.body.clientWidth){
						break
					}	
					template = o.template;
				}
			}
			return $(template).html();
		},
		drawTemplate: function(el,opts){
			if(_ != undefined && _ != null){
				this.opened = true;
				//add template
				var params = this.getParamsByElement(el);
				$("body").prepend(_.template(this.template,params));

				//set able control
				$("#rnbox-container").attr("data-rnbox-linkid",$(el).attr("data-rnbox-id"));
				$(".rnbox-close").click(this.closeHandler(opts));
				
				if(this.getGroupByContainer().length >= 2){
					$(".rnbox-next").click(this.nextHandler(opts));
					$(".rnbox-prev").click(this.prevHandler(opts));
				}else{
					$(".rnbox-next").add(".rnbox-prev").add(".rnbox-control").hide();
				}

				//hidden scrollbar
				$("body").add(opts.root).addClass("hidden");

				//fitting image
				if($("#rnbox-image.rnbox-image-fit").length){
					this.fitImage();
				}
			}else{
				console.warn("this library requred underscore.js")
			}
		},
		//this mesthod using "natruralWidth" and "natruralHeight"
		//but "naturalWidth" and "natruralHeight" is requred IE9+ sorry.
		fitImage: function(){
			var ratio = Math.min($(window).width()/$("#rnbox-image.rnbox-image-fit").attr("naturalWidth"),$(window).height()/$("#rnbox-image.rnbox-image-fit").attr("naturalHeight"));
			if(ratio < 1){
				var width = $("#rnbox-image.rnbox-image-fit").attr("naturalWidth")*ratio;
				var height = $("#rnbox-image.rnbox-image-fit").attr("naturalHeight")*ratio;
				$("#rnbox-image.rnbox-image-fit").width(width);
				$("#rnbox-image.rnbox-image-fit").height(height);
			}
		},
		resizeHandler: function(opts){
			var that = this;
			return function(){
				
				if(that.opened){
					var template = that.getTemplateByWindowWidth(opts);
					if(that.template != template){
						that.template = template	
						var el = that.getItemByContainer()[0];
						that.closeTemplate(opts.root);
						that.drawTemplate(el,opts);
					}
					if($("#rnbox-image.rnbox-image-fit").length){
						that.fitImage();
					}

				}
			}
		},
		nextHandler: function(opts){
			var that = this;
			return function(){
				var next = that.getNextItem()[0];
				that.closeTemplate(opts.root);
				that.drawTemplate(next,opts);
			}
		},
		prevHandler: function(opts){
			var that = this;
			return function(){
				var prev = that.getPrevItem()[0];
				that.closeTemplate(opts.root);
				that.drawTemplate(prev,opts);
			}
		},
		closeTemplate: function(root){
			$("#rnbox-container").remove();
			$("body").add(root).removeClass("hidden");
			this.opened = false;
		},
		closeHandler: function(opts){
			var that = this;
			return function(){
				that.closeTemplate(opts.root);
			}
		},
		getNextItem: function(){
			var index = this.getIndexByGroup();
			var container = this.getGroupByContainer();
			var el = container[++index];
			return $(el ? el : container[0]);
		},
		getPrevItem: function(){
			var index = this.getIndexByGroup();
			var container = this.getGroupByContainer();
			var el = container[--index];
			return $(el ? el : container[container.length-1]);
		},
		getIndexByGroup: function(){
			var index;
			var that = this;
			that.getGroupByContainer().each(function(i,el){
				if($(el).attr("data-rnbox-id") == that.getItemByContainer().attr("data-rnbox-id")){
					index = i
					return false
				}
			});
			return index
		},
		getItemByContainer: function(){
			var id = $("#rnbox-container").attr("data-rnbox-linkid");
			return $("*[data-rnbox-id="+id+ "]");
		},
		getGroupByContainer: function(){
			var item = this.getItemByContainer();
			var group_id = $(item).attr("data-rnbox-group");
			if(group_id == this.reservedListSelector){
				return $(item).parents("ul").find("*[data-rnbox-group="+this.reservedListSelector+"]");
			}else{
				return $("*[data-rnbox-group="+group_id+"]");
			}
		},
		getParamsByElement: function(el){
			var params = {
				rel: null
			}
			for(var p in params){
				params[p] = el.getAttribute(p);
			}
			return params
		},
		embedStyle: function(root){
			var t = _.template(this.style,{
				root: root
			});
			$('head').append('<style>'+t+'</style>');
		},
		getContentPosition: function(){
			return (document.body.clientHeight -  $("#rnbox-conent").outerHeight())+"px";
		},
		style: "#rnbox-container{position:fixed;} #rnbox-container:before{height:100%;display:inline-block;vertical-align:middle;} #rnbox-content{display:inline-block;} .hidden{overflow:hidden;overflow-x:hidden;overflow-y:hidden;};"
	});
}).call(this);

