const events = require('events');
var https=require("https");
var mailer = require('../mailer');
var config = require('config');
var microserviceConfig = config.get('microservice.config');

var EventEngine = function(){
    this.event_emitter = new events.EventEmitter();
    this.EventLoopInterval = 10000; // number of milliseconds 
};

EventEngine.prototype.Start = function () {
	var that = this;
    console.log("Starting Event Engine");
    console.log("---------------------------------------");
    console.log("Monitoring the following microservices");
    console.log("---------------------------------------");
    console.log(microserviceConfig.services);
    console.log("---------------------------------------");
	setInterval(function () {
		try{        
			var promises = that.GetStatus(microserviceConfig.services);

			Promise.all(promises).then(function(values){
				for(var i = 0; i < values.length; i++){
					var value = values[i];
					
					if(value.data){
                        console.log("---------------------------------------");
                        console.log("Address and Port Result");
                        console.log(value.data.service.ping  + ":" + value.data.service.env);
                        message = "Service is up!";                        
                        if(!value.data.success){
                            var apiService = value.data.service;
                            message = "Service is DOWN!!!";
                            var service;
                            for(var j = 0; j < microserviceConfig.services.length; j++){
                                if(microserviceConfig.services[j].ping === apiService.ping && microserviceConfig.services[j].env === apiService.env){
                                    service = microserviceConfig.services[j];
                                }
                            }                            
                            if(service.triggered){
                                console.log("Text has already been delivered.");
                            } else {
                                that.SendAlert(service).then(function(data){                            
                                    console.log(data);
                                }).catch(function(err){                                
                                    console.log(err);
                                });
                            }

                            service.triggered = true;
                            
                        }
                        console.log(message);                        
                        console.log("---------------------------------------");
						
					}
				}				
			}).catch(function(err){
                console.log(err);              
						
			});		

		} catch(e){
			console.log("failed interval");
			console.log(e);
		}
        
	}, this.EventLoopInterval);
};

EventEngine.prototype.GetStatus = function(services){
    var promises = [];
    for(var i = 0; i < services.length; i++){
        var url = services[i].ping;
        promises.push(this.GetMicroserviceData(url, services[i]));
    }
    return promises;
};

EventEngine.prototype.GetMicroserviceData = function(url, service){

    var that = this;
    
	return new Promise(function(fulfill, reject){
        var request = https.get(url, res => {
            if (res.statusCode < 200 || 
                res.statusCode > 299) {
                fulfill({ 'data' : {'success' : false, service }});
            } else {
                fulfill({ 'data' : {'success' : true,  service}});
            }
          
        });
    });
};

EventEngine.prototype.SendAlert = function(service){
    console.log('Sending SMS alert')
    return new Promise(function(fulfill, reject){

        var post_data = {
            message: service.env + " services are down",
            url : service.ping   
        }
        mailer.sendAlert(post_data.message, post_data.ping);
        // send email from here 
    });
};

module.exports = new EventEngine();