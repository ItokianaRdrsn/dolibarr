backoffice :
   ### page dashboard 
       -affichage somme de salaire par genre:
            1-utiliser l'endPoint /salaries pour recuperer tous les salaires 
            2-ensuite pour avoir le genre dans salaire il y a fk_user a qui appartient ce salaire et on faire 
            /user/fk_user et ensuite on a son genre

            note:petit probleme car /salaries  on peut avoir plusieurs fois le meme fk_user car un user peut avoir  plusieurs salaires, alors d'abord :
                        1/ on prend les salaire 
                        2/ on map les salaires map(salaray=>salary.fk)
                        3/ on creer un set pour enelever les doublons new Set( map(salaray=>salary.fk)) 
                        4/ on transforme le set en tableau const userId=[...new Set( map(salaray=>salary.fk))]
                        5/ la on a les userId ,on fait une boucle pour recuperer tous les user et stocket dans un object:
                            for(const user_id of user_ids){
                                if(getUserCache.value[user_id]){
                                    continue;
                                }
                                getUserCache.value[user_id] = await getUser(user_id);
                            }
                        6/On utilise Filter pour separer par genre:
                             const salariesByWomen=computed(() => salaries.value.filter((salary) => {
                                const user = getUserCache.value[salary.fk_user];
                                return user?.gender == 'woman';
                            }));
                            
                            const salariesByMen=computed(() => salaries.value.filter((salary) => {
                                const user = getUserCache.value[salary.fk_user];
                                return user?.gender == 'man';
                            }));


       -afficahe somme de salaire par mois ,date de reglement comme reference