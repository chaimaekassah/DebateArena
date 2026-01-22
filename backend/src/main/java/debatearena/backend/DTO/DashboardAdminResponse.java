package debatearena.backend.DTO;



import java.time.LocalDateTime;


public class DashboardAdminResponse {
    // Statistiques globales
    private Integer totalUtilisateurs;
    private Integer totalDebats;
    private Integer debatsEnCours;
    private Integer totalTests;
    private Double noteMoyenneTests;

    // Signalements
    private Integer signalementsEnAttente;
    private Integer signalementsTraites30j;

    // Sujets
    private Integer totalSujets;
    private Integer sujetsTendance;

    // Activité récente
    private ActivityStats activite24h;
    private ActivityStats activite7j;
    private ActivityStats activite30j;


    public static class ActivityStats {
        private Integer nouveauxUtilisateurs;
        private Integer debatsCrees;
        private Integer messagesEnvoyes;

        public ActivityStats(Integer nouveauxUtilisateurs, Integer debatsCrees, Integer messagesEnvoyes) {
            this.nouveauxUtilisateurs = nouveauxUtilisateurs;
            this.debatsCrees = debatsCrees;
            this.messagesEnvoyes = messagesEnvoyes;
        }

        public ActivityStats() {
        }

        public Integer getNouveauxUtilisateurs() {
            return nouveauxUtilisateurs;
        }

        public void setNouveauxUtilisateurs(Integer nouveauxUtilisateurs) {
            this.nouveauxUtilisateurs = nouveauxUtilisateurs;
        }

        public Integer getDebatsCrees() {
            return debatsCrees;
        }

        public void setDebatsCrees(Integer debatsCrees) {
            this.debatsCrees = debatsCrees;
        }

        public Integer getMessagesEnvoyes() {
            return messagesEnvoyes;
        }

        public void setMessagesEnvoyes(Integer messagesEnvoyes) {
            this.messagesEnvoyes = messagesEnvoyes;
        }
    }

    public DashboardAdminResponse(Integer totalUtilisateurs,
                                  Integer totalDebats,
                                  Integer debatsEnCours,
                                  Integer totalTests,
                                  Double noteMoyenneTests,
                                  Integer signalementsEnAttente,
                                  Integer signalementsTraites30j,
                                  Integer totalSujets,
                                  Integer sujetsTendance,
                                  ActivityStats activite24h,
                                  ActivityStats activite7j,
                                  ActivityStats activite30j) {
        this.totalUtilisateurs = totalUtilisateurs;
        this.totalDebats = totalDebats;
        this.debatsEnCours = debatsEnCours;
        this.totalTests = totalTests;
        this.noteMoyenneTests = noteMoyenneTests;
        this.signalementsEnAttente = signalementsEnAttente;
        this.signalementsTraites30j = signalementsTraites30j;
        this.totalSujets = totalSujets;
        this.sujetsTendance = sujetsTendance;
        this.activite24h = activite24h;
        this.activite7j = activite7j;
        this.activite30j = activite30j;
    }

    public DashboardAdminResponse() {
    }

    public Integer getTotalUtilisateurs() {
        return totalUtilisateurs;
    }

    public void setTotalUtilisateurs(Integer totalUtilisateurs) {
        this.totalUtilisateurs = totalUtilisateurs;
    }

    public Integer getTotalDebats() {
        return totalDebats;
    }

    public void setTotalDebats(Integer totalDebats) {
        this.totalDebats = totalDebats;
    }

    public Integer getDebatsEnCours() {
        return debatsEnCours;
    }

    public void setDebatsEnCours(Integer debatsEnCours) {
        this.debatsEnCours = debatsEnCours;
    }

    public Integer getTotalTests() {
        return totalTests;
    }

    public void setTotalTests(Integer totalTests) {
        this.totalTests = totalTests;
    }

    public Double getNoteMoyenneTests() {
        return noteMoyenneTests;
    }

    public void setNoteMoyenneTests(Double noteMoyenneTests) {
        this.noteMoyenneTests = noteMoyenneTests;
    }

    public Integer getSignalementsEnAttente() {
        return signalementsEnAttente;
    }

    public void setSignalementsEnAttente(Integer signalementsEnAttente) {
        this.signalementsEnAttente = signalementsEnAttente;
    }

    public Integer getSignalementsTraites30j() {
        return signalementsTraites30j;
    }

    public void setSignalementsTraites30j(Integer signalementsTraites30j) {
        this.signalementsTraites30j = signalementsTraites30j;
    }

    public Integer getTotalSujets() {
        return totalSujets;
    }

    public void setTotalSujets(Integer totalSujets) {
        this.totalSujets = totalSujets;
    }

    public Integer getSujetsTendance() {
        return sujetsTendance;
    }

    public void setSujetsTendance(Integer sujetsTendance) {
        this.sujetsTendance = sujetsTendance;
    }

    public ActivityStats getActivite24h() {
        return activite24h;
    }

    public void setActivite24h(ActivityStats activite24h) {
        this.activite24h = activite24h;
    }

    public ActivityStats getActivite7j() {
        return activite7j;
    }

    public void setActivite7j(ActivityStats activite7j) {
        this.activite7j = activite7j;
    }

    public ActivityStats getActivite30j() {
        return activite30j;
    }

    public void setActivite30j(ActivityStats activite30j) {
        this.activite30j = activite30j;
    }
}