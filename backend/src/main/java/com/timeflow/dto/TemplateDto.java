package com.timeflow.dto;

public class TemplateDto {

    private String id;
    private String label;
    private String defaultTitle;
    private String messageBody;
    private String suggestedType; // WHATSAPP, ALARM, CALENDAR

    public TemplateDto() {
    }

    public TemplateDto(String id, String label, String defaultTitle, String messageBody, String suggestedType) {
        this.id = id;
        this.label = label;
        this.defaultTitle = defaultTitle;
        this.messageBody = messageBody;
        this.suggestedType = suggestedType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDefaultTitle() {
        return defaultTitle;
    }

    public void setDefaultTitle(String defaultTitle) {
        this.defaultTitle = defaultTitle;
    }

    public String getMessageBody() {
        return messageBody;
    }

    public void setMessageBody(String messageBody) {
        this.messageBody = messageBody;
    }

    public String getSuggestedType() {
        return suggestedType;
    }

    public void setSuggestedType(String suggestedType) {
        this.suggestedType = suggestedType;
    }
}
