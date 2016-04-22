var React = require('react');
$=jQuery = require('jquery');
var Infinite = require('react-infinite');
var _ = require('lodash');
var NotificationSystem = require('react-notification-system');

const subscribe_key = `sub-c-67535ca4-fba2-11e5-8b0b-0619f8945a4f`,
    publish_key  = `pub-c-655bcfed-5800-4602-8eca-e0a4668b5252`

const pubnub = PUBNUB.init({                         
    publish_key   : publish_key,
    subscribe_key : subscribe_key
});


var ChatBody = React.createClass({
	render:function(){
		
			var messageList = this.props.data.map(function(message,index){
				return(

				     <li className="collection-item avatar" key={index} >
				       <img src={message.avatar_url} className="circle" />
				       <span className="title">Anonymous robot #{message.uid}</span>
				       <p><i className="prefix mdi-action-alarm"></i>
				       <span className="message-date">{message.createdTime}</span><br />{message.message}
				       </p>
				     </li>		     
    );
			});

		return (
				<ul className="collection">			
    				{messageList}  
    			</ul>	 	
			);
	}
});

var ChatForm = React.createClass({
	
	handleSubmit:function(e)
	{
		e.preventDefault();
		var message = this.refs.Message.value.trim();
		var time = new Date().getTime(),
		date = new Date(time),
		datestring = date.toUTCString().slice(0, -4);
		var avatar_url = "http://robohash.org/" + this.props.user + "?set=set2&bgset=bg2&size=70x70";
		var UUID = this.props.user;
		if(!message){
			return;
		}
		this.props.onMessageSubmit({message: message,createdTime:datestring,avatar_url:avatar_url,uid:UUID});
        this.refs.Message.value='';
        return;	
	},
	
	render:function(){
			var UUID = this.props.user;
			var avatar_url = "http://robohash.org/" + this.props.user + "?set=set2&bgset=bg2&size=70x70";
		return (
				<footer className="teal">
					<form  className="container" onSubmit= {this.handleSubmit}>
			       <div className="row">
			         <div className="input-field col s10">
			           <i className="prefix mdi-communication-chat"></i>
			           <input type="text" placeholder="Type your message" ref="Message
			           "/>
			           <span className="chip left">
			             <img src={avatar_url} />
			            Anonymous robot #{UUID}
			           </span>
			         </div>
			         <div className="input-field col s2">
			           <button  id="btn" type="submit" className="waves-effect waves-light btn-floating btn-large">
			             <i className="mdi-content-send"></i>
			           </button>
			         </div>
			       </div>
			      </form>
				</footer>
			);
	}
});

var Notify = React.createClass({

    render:function(){
      return (
        <div className="" >
        { this.props.showResults ? <Results text={this.props.text} /> : null }
        </div>
      );
    }
});
var Results = React.createClass({
    render: function() {
        var notif;
         if (this.props.text === "Loading"){
              notif = <div id="results" className="ngn ngn-success">
               Loading New Mesages .......
            </div>
          }
            else if(this.props.text === "AllMessagesFetched"){
            notif = <div id="results" className="ngn ngn-info">
               No More Messages To Fetch....
            </div>
             }  
             else if (this.props.text === "ItDis"){
              notif = <div id="results" className="ngn ngn-warning">
               Internet Disconnected Trying to Reconnect
            </div>
             }
             else 
              notif = <div id="results" className="ngn ngn-info">
               Internet Connected..
            </div>
             

        return (
        <div>
            {notif}
            </div>
        );
    }
});

var Main = React.createClass({

  _notificationSystem: null,
   scrolling:function (){
      {        var $win = $(window);
var prevScrollHeight = $('body').get(0).scrollHeight-($win.height()+$win.innerHeight());
                 if ($win.scrollTop() == 0){
                    if(this.state.allMessagesFetched){
                      this.setState({text:'AllMessagesFetched',showResults:true});
                      setTimeout(()=>this.scrollDown(400),1000);
                    }
                    else
                    {    this.setState({text:'Loading',showResults:true})
                        this.his(prevScrollHeight);
                      }
                 }
                
             }
    },

    getInitialState: function()
    {
    return {data: [],user:Math.floor(Math.random()*90000) + 10000,errors:'',start:'',allMessagesFetched:false, text:'' ,showResults: false};
    },

	scrollDown:function(time)
  { this.setState({showResults:false});
	 var element = $('.collection');
        $('body').animate({
            scrollTop: element.height()
        }, time);
  },  
scrollmiddle:function(time,scrollheight)
  { 
   var element = $('.collection');
        $('body').animate({
            scrollTop:scrollheight
        }, time);
    },  

	 sub:function(){
    this.setState({text:'',showResults:false});
	 	pubnub.subscribe({
		  channel: 'chat_channel',
      disconnect : function() {   
        // this.setState({text:'ItDis',showResults:true});
         this.refs.notificationSystem.addNotification({
      message: 'Internet Disconnected ',
      position:'tc',
      dismissible:false,
      uid:20,
      level: 'error'
    });
    }.bind(this),
    reconnect  : function()
    {  
       this.refs.notificationSystem.addNotification({
      message: 'Internet Connected',
      position:'tc',
      dismissible:false,
      uid:20,
      level: 'info'
    });
        // this.setState({text:'Connected',showResults:true});
    }.bind(this),
		  message : function (message, channel) {
		  	var messages = this.state.data;
    			var newMessages = messages.concat([message]);
     		 	this.setState({data:newMessages});
     		 	this.scrollDown(400);
   			 }.bind(this),
		    error: function (error) {
		      console.log(JSON.stringify(error));
		    }.bind(this),
 		});
	 },

   his:function(scrollheight){
    var defaultMessagesNumber = 20;
    var starttime= this.state.start;
    pubnub.history({
    channel : 'chat_channel',
    count : defaultMessagesNumber,
    reverse: false,
    start:starttime,
    callback : function(m){

          var messages = this.state.data;
          var another = m[0].concat(messages);
          this.setState({data:another,start:m[1],showResults:false});
          if(m[0].length < defaultMessagesNumber)
        {
          this.setState({allMessagesFetched:true});
        }
         if(scrollheight)
        {
          this.scrollmiddle(400,scrollheight)
        }
        else
        {
          this.scrollDown(400);
        }
        }.bind(this),
        error: function(m){
        deferred.reject(m)
     },
  });
   },

	 pub:function(message){
		pubnub.publish({
    		channel: 'chat_channel',        
    		message: message,
    		callback : function(m){
    			 console.log(m);
    		}.bind(this)
		});
	 },

	handleMessageSubmit :function(message){
	var messages = this.state.data;
    var newMessages = messages.concat([message]);
     this.pub(message);
	},

componentDidMount: function()
  {
    this.his();
    this.sub();
    window.addEventListener("scroll",_.debounce(this.scrolling,250));
  },

  componentWillUnmount: function()
  {
 window.removeEventListener("scroll",_.debounce(this.scrolling,250));
  },

 render:function(){
   
		return (
				<div >
        <NotificationSystem ref="notificationSystem" />
        <Notify text={this.state.text}  showResults={this.state.showResults}/>
				<ChatBody data ={this.state.data}/>
				<ChatForm onMessageSubmit={this.handleMessageSubmit} user = {this.state.user}  />
				</div>
			);
	}
});

module.exports = Main;
