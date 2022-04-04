﻿using CTFServer.Hubs;
using CTFServer.Hubs.Client;
using CTFServer.Models.Request.Admin;
using Microsoft.AspNetCore.SignalR;
using Serilog;
using Serilog.Configuration;
using Serilog.Core;
using Serilog.Events;

namespace CTFServer.Extensions;

public static class SignalRSinkExtension
{
    public static LoggerConfiguration SignalR(
        this LoggerSinkConfiguration loggerConfiguration,
        IServiceProvider serviceProvider)
        => loggerConfiguration.Sink(new SignalRSink(serviceProvider));
}

public class SignalRSink : ILogEventSink
{
    private readonly IServiceProvider serviceProvider;
    private IHubContext<LoggingHub, ILoggingClient>? hubContext;

    public SignalRSink(IServiceProvider _serviceProvider)
    {
        serviceProvider = _serviceProvider;
    }
    
    public async void Emit(LogEvent logEvent)
    {
        if (hubContext is null)
            hubContext = serviceProvider.GetRequiredService<IHubContext<LoggingHub, ILoggingClient>>();

        if (logEvent.Level >= LogEventLevel.Information)
        {
            await hubContext.Clients.All.ReceivedLog(
                new LogMessageModel
                {
                    Time = logEvent.Timestamp,
                    Level = logEvent.Level.ToString(),
                    UserName = logEvent.Properties["UserName"].ToString(),
                    IP = logEvent.Properties["IP"].ToString(),
                    Msg = logEvent.RenderMessage(),
                    Status = logEvent.Properties["Status"].ToString()
                });
        }
    }
}